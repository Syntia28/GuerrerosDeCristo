"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
  estado: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios desde tu API
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/admin/users"); // endpoint que lista todos los usuarios
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const updateEstado = async (id: number, estado: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, estado } : u))
      );
    } else {
      alert(data.error || "Error al actualizar estado");
    }
  };

  if (loading) return <p>Cargando integrantes...</p>;

  return (
    <div>
      <h1>Panel de Administración</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u.estado}</td>
              <td>
                <button onClick={() => updateEstado(u.id, "aprobado")}>
                  Aprobar
                </button>
                <button onClick={() => updateEstado(u.id, "rechazado")}>
                  Rechazar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
