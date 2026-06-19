"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  stats: {
    totalSold: number;
    totalMoney: number;
    paidMoney: number;
    pendingMoney: number;
  };
}

interface Ticket {
  id: number;
  number: number;
  clientName: string;
  clientPhone: string;
  price: number;
  paid: boolean;
  soldBy: {
    id: number;
    name: string;
    username: string;
  };
  soldAt: string;
}

interface Stats {
  totalSold: number;
  totalMoney: number;
  paidMoney: number;
  pendingMoney: number;
  totalUsers: number;
}

type Tab = "overview" | "tickets" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats>({
    totalSold: 0,
    totalMoney: 0,
    paidMoney: 0,
    pendingMoney: 0,
    totalUsers: 0
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Polling states
  const [pollingActive, setPollingActive] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaid, setFilterPaid] = useState<"all" | "paid" | "pending">("all");

  // Modals / Form states
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editPrice, setEditPrice] = useState(10);
  const [editPaid, setEditPaid] = useState(false);
  const [editSoldById, setEditSoldById] = useState<number | "">("");

  const [showRegisterSaleModal, setShowRegisterSaleModal] = useState(false);
  const [regNumber, setRegNumber] = useState<number | "">("");
  const [regClientName, setRegClientName] = useState("");
  const [regClientPhone, setRegClientPhone] = useState("");
  const [regPrice, setRegPrice] = useState(10);
  const [regPaid, setRegPaid] = useState(false);
  const [regSoldById, setRegSoldById] = useState<number | "">("");

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("MEMBER");

  const TOTAL_TICKETS = 100;
  const soldNumbers = tickets.map((t) => t.number);

  // Fetch all administrative data
  const fetchData = async (isManual = false) => {
    if (isManual) setSyncing(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTickets(data.tickets || []);
        setUsers(data.users || []);
        setError("");
      } else {
        const errData = await res.json();
        setError(errData.error || "Error al obtener los datos del servidor.");
      }
    } catch (err) {
      setError("Error de conexión al sincronizar los datos.");
    } finally {
      setLoading(false);
      setSyncing(false);
      setCountdown(10); // Reset polling timer
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Polling loop effect
  useEffect(() => {
    if (!pollingActive) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pollingActive]);

  // Quick toggle payment status
  const handleTogglePaid = async (ticket: Ticket) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !ticket.paid })
      });
      if (res.ok) {
        setSuccess(`Estado de pago del boleto #${ticket.number} actualizado.`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("No se pudo actualizar el estado de pago.");
      }
    } catch (err) {
      setError("Error al enviar la solicitud.");
    }
  };

  // Cancel / Delete a ticket sale
  const handleDeleteTicket = async (ticketId: number, num: number) => {
    if (!confirm(`¿Estás seguro de cancelar la venta del boleto #${num}? El número volverá a estar disponible.`)) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccess(`La venta del boleto #${num} ha sido cancelada.`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Error al cancelar la venta.");
      }
    } catch (err) {
      setError("Error al enviar la solicitud.");
    }
  };

  // Open Edit Ticket modal
  const openEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditClientName(ticket.clientName);
    setEditClientPhone(ticket.clientPhone);
    setEditPrice(ticket.price);
    setEditPaid(ticket.paid);
    setEditSoldById(ticket.soldBy?.id || "");
    setShowEditTicketModal(true);
  };

  // Save edited ticket
  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      const res = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: editClientName,
          clientPhone: editClientPhone,
          price: editPrice,
          paid: editPaid,
          soldById: editSoldById
        })
      });

      if (res.ok) {
        setSuccess(`Datos del boleto #${editingTicket.number} actualizados con éxito.`);
        setShowEditTicketModal(false);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo actualizar el boleto.");
      }
    } catch (err) {
      setError("Error de red.");
    }
  };

  // Open Register Sale modal
  const openRegisterSale = (number: number) => {
    setRegNumber(number);
    setRegClientName("");
    setRegClientPhone("");
    setRegPrice(10);
    setRegPaid(false);
    setRegSoldById(users[0]?.id || "");
    setShowRegisterSaleModal(true);
  };

  // Submit new sale from admin
  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regNumber === "" || regSoldById === "") return;

    try {
      // In this system, POST to /api/tickets assigns the ticket to the current session user.
      // However, we want to allow admin to assign it to ANY user.
      // We can first create it (associated to admin), and then immediately call PUT to reassign it,
      // or we can modify the API, but let's check if the POST endpoint supports custom soldById.
      // Looking at src/app/api/tickets/route.ts POST:
      // It sets soldById = payload.id (admin ID).
      // So we can:
      // 1. Create the sale (POST /api/tickets) which assigns it to the admin.
      // 2. If the user selected a different seller (regSoldById !== adminId), we call PUT /api/tickets/[newId] to reassign it!
      // This is extremely robust and requires NO changes to POST API!
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: regNumber,
          clientName: regClientName,
          clientPhone: regClientPhone,
          price: regPrice,
          paid: regPaid
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const createdTicket = data.ticket;
        
        // If assigned seller is different from the admin session, update it
        if (regSoldById !== createdTicket.soldById) {
          await fetch(`/api/tickets/${createdTicket.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ soldById: regSoldById })
          });
        }

        setSuccess(`¡Boleto #${regNumber} registrado y asignado con éxito!`);
        setShowRegisterSaleModal(false);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "No se pudo registrar la venta.");
      }
    } catch (err) {
      setError("Error de red.");
    }
  };

  // Add new member
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          role: newUserRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Integrante "${newUserName}" creado exitosamente.`);
        setShowAddUserModal(false);
        // Clear fields
        setNewUserName("");
        setNewUserUsername("");
        setNewUserPassword("");
        setNewUserRole("MEMBER");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "No se pudo registrar el integrante.");
      }
    } catch (err) {
      setError("Error al conectar con la API.");
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (user: User) => {
    const nextRole = user.role === "ADMIN" ? "MEMBER" : "ADMIN";
    if (!confirm(`¿Estás seguro de cambiar el rol de ${user.name} a ${nextRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        setSuccess(`Rol de ${user.name} actualizado a ${nextRole}.`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar el rol.");
      }
    } catch (err) {
      setError("Error de conexión.");
    }
  };

  // Delete user account
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente a ${user.name}? ADVERTENCIA: Esta acción es irreversible y liberará (eliminará) todos los ${user.stats.totalSold} boletos vendidos por él.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccess(`Integrante ${user.name} eliminado. Sus boletos han sido liberados.`);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "No se pudo eliminar al integrante.");
      }
    } catch (err) {
      setError("Error al enviar la solicitud.");
    }
  };

  // Filtered tickets list
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.number.toString().includes(searchQuery) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientPhone.includes(searchQuery) ||
      (t.soldBy?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPaid =
      filterPaid === "all" ||
      (filterPaid === "paid" && t.paid) ||
      (filterPaid === "pending" && !t.paid);

    return matchesSearch && matchesPaid;
  });

  return (
    <div className="gradient-bg min-h-screen text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title & Live Status */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[#F5BE27]/20 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#F5BE27] flex items-center gap-3">
              <i className="fas fa-user-shield"></i> Panel de Super Administrador
            </h1>
            <p className="text-gray-400 text-sm mt-1">Supervisa integrantes, boletos vendidos, cobranzas y estadísticas generales.</p>
          </div>

          {/* Time Sync Status Block */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 self-start md:self-auto shadow-inner">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3.5 w-3.5`}>
                {pollingActive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                )}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                {pollingActive ? `Live (Refresco en ${countdown}s)` : "Sondeo pausado"}
              </span>
            </div>

            <div className="h-6 w-px bg-white/10"></div>

            <button
              onClick={() => setPollingActive(!pollingActive)}
              className={`text-[10px] font-bold py-1 px-2.5 rounded border uppercase transition-all bg-transparent ${
                pollingActive
                  ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              }`}
              title={pollingActive ? "Pausar actualización automática" : "Activar actualización automática"}
            >
              {pollingActive ? "Pausar" : "Activar"}
            </button>

            <button
              onClick={() => fetchData(true)}
              disabled={syncing}
              className="btn btn-outline py-1 px-3 text-[10px] uppercase font-bold flex gap-1 items-center"
            >
              <i className={`fas fa-sync-alt ${syncing ? "fa-spin" : ""}`}></i>
              Sincronizar
            </button>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-sm flex gap-2 items-center animate-fadeIn">
            <i className="fas fa-exclamation-circle text-base"></i>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex gap-2 items-center animate-fadeIn">
            <i className="fas fa-check-circle text-base"></i>
            <span>{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 text-sm md:text-base gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 font-bold uppercase tracking-wider transition-all bg-transparent border-b-2 ${
              activeTab === "overview"
                ? "text-[#F5BE27] border-[#F5BE27]"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i> Estadísticas
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-4 font-bold uppercase tracking-wider transition-all bg-transparent border-b-2 ${
              activeTab === "tickets"
                ? "text-[#F5BE27] border-[#F5BE27]"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <i className="fas fa-ticket-alt mr-2"></i> Boletos / Ventas
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 font-bold uppercase tracking-wider transition-all bg-transparent border-b-2 ${
              activeTab === "users"
                ? "text-[#F5BE27] border-[#F5BE27]"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <i className="fas fa-users mr-2"></i> Integrantes
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin fa-3x text-[#F5BE27]"></i>
            <p className="mt-4 text-base">Cargando base de datos...</p>
          </div>
        ) : (
          <>
            {/* TABS SECTIONS */}

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card p-6 flex flex-col items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Porcentaje Vendido</span>
                    <span className="text-4xl font-extrabold text-[#F5BE27]">
                      {((stats.totalSold / TOTAL_TICKETS) * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                      {stats.totalSold} de {TOTAL_TICKETS} Boletos Vendidos
                    </span>
                    <div className="w-full bg-black/40 h-2 rounded-full mt-4 overflow-hidden border border-white/5">
                      <div
                        className="bg-[#F5BE27] h-full rounded-full transition-all"
                        style={{ width: `${(stats.totalSold / TOTAL_TICKETS) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="glass-card p-6 flex flex-col items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Total Recaudado</span>
                    <span className="text-4xl font-extrabold text-emerald-400">S/. {stats.paidMoney.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">Efectivo cobrado y en caja</span>
                  </div>

                  <div className="glass-card p-6 flex flex-col items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Pendiente de Cobro</span>
                    <span className="text-4xl font-extrabold text-amber-500">S/. {stats.pendingMoney.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">Ventas pendientes de pago</span>
                  </div>

                  <div className="glass-card p-6 flex flex-col items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Total Pro-Fondos</span>
                    <span className="text-4xl font-extrabold text-blue-400">S/. {stats.totalMoney.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 mt-2 font-medium">Recaudación total proyectada</span>
                  </div>
                </div>

                {/* Second Level Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Performance Ranking */}
                  <div className="lg:col-span-6 glass-card p-6">
                    <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider">
                      <i className="fas fa-trophy"></i> Rendimiento de Integrantes
                    </h3>
                    <div className="flex flex-col gap-4">
                      {users.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay integrantes registrados.</p>
                      ) : (
                        users
                          .map((u) => u)
                          .sort((a, b) => b.stats.totalSold - a.stats.totalSold)
                          .slice(0, 5)
                          .map((user, idx) => (
                            <div key={user.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-[#F5BE27] text-sm bg-black/40 rounded-lg w-7 h-7 flex items-center justify-center">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-sm text-white">{user.name}</p>
                                  <span className="text-xs text-gray-400">@{user.username}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm text-emerald-400 bg-emerald-950/20 py-1 px-3 border border-emerald-500/20 rounded-full">
                                  {user.stats.totalSold} Boletos
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1">S/. {user.stats.paidMoney.toFixed(2)} recaudados</p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Quick summary notes */}
                  <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider">
                        <i className="fas fa-info-circle"></i> Resumen de Operación
                      </h3>
                      <div className="flex flex-col gap-3 text-sm text-gray-300">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Miembros Activos:</span>
                          <span className="font-bold text-white">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Boletos Libres:</span>
                          <span className="font-bold text-emerald-400">{TOTAL_TICKETS - stats.totalSold}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Promedio Precio de Boleto:</span>
                          <span className="font-bold text-white">
                            S/. {stats.totalSold > 0 ? (stats.totalMoney / stats.totalSold).toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span>Eficiencia de Cobro:</span>
                          <span className="font-bold text-emerald-400">
                            {stats.totalMoney > 0 ? ((stats.paidMoney / stats.totalMoney) * 100).toFixed(1) : "0.0"}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("tickets")}
                      className="btn btn-primary w-full py-3 mt-6 uppercase text-xs font-bold tracking-wider"
                    >
                      Ir a Gestionar Ventas <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TICKETS */}
            {activeTab === "tickets" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                {/* 100 Ticket Interactive Grid Map */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-[#F5BE27] mb-2 uppercase tracking-wider">
                    <i className="fas fa-th"></i> Mapa de Boletos (1 - 100)
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Haz clic en un número en <span className="text-[#34d399] font-bold">verde</span> para registrar una venta rápida. Los números en <span className="text-[#f87171] font-bold">rojo</span> ya están vendidos.
                  </p>

                  <div className="ticket-selector-grid">
                    {Array.from({ length: TOTAL_TICKETS }, (_, idx) => {
                      const num = idx + 1;
                      const ticket = tickets.find((t) => t.number === num);
                      const isSold = !!ticket;

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (isSold) {
                              openEditTicket(ticket);
                            } else {
                              openRegisterSale(num);
                            }
                          }}
                          className={`ticket-number-btn text-xs font-bold ${
                            isSold ? "ticket-btn-sold" : "ticket-btn-available"
                          }`}
                          title={isSold ? `Boleto #${num} - ${ticket.clientName} (Vendido por ${ticket.soldBy?.name})` : `Boleto #${num} disponible`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search, Filter & Sales Table */}
                <div className="glass-card p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-[#F5BE27] uppercase tracking-wider m-0">
                      <i className="fas fa-list-alt"></i> Listado General de Ventas
                    </h3>

                    {/* Search & Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input
                          type="text"
                          placeholder="Buscar número, cliente, integrante..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="glass-input pl-9 text-xs py-2 w-full sm:w-60"
                        />
                      </div>

                      <select
                        value={filterPaid}
                        onChange={(e: any) => setFilterPaid(e.target.value)}
                        className="glass-input text-xs py-2 px-3 bg-[#111111] border border-white/10 rounded-lg text-white"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="paid">Solo Pagados</option>
                        <option value="pending">Solo Pendientes</option>
                      </select>
                    </div>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      No se encontraron ventas con los filtros indicados.
                    </div>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table text-sm">
                        <thead>
                          <tr>
                            <th>Nº</th>
                            <th>Cliente</th>
                            <th>Teléfono</th>
                            <th>Precio</th>
                            <th>Estado de Pago</th>
                            <th>Vendedor (Integrante)</th>
                            <th className="text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTickets.map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="font-extrabold text-[#F5BE27] text-base">#{ticket.number}</td>
                              <td className="font-semibold text-white">{ticket.clientName}</td>
                              <td>{ticket.clientPhone}</td>
                              <td className="font-medium">S/. {ticket.price.toFixed(2)}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePaid(ticket)}
                                  className={`py-1 px-3.5 rounded-full text-xs font-bold border transition-all ${
                                    ticket.paid
                                      ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500 hover:text-white"
                                      : "bg-amber-950/30 text-amber-400 border-amber-500/40 hover:bg-amber-500 hover:text-white"
                                  }`}
                                >
                                  <i className={`fas ${ticket.paid ? "fa-check-circle" : "fa-clock"} mr-1.5`}></i>
                                  {ticket.paid ? "Pagado" : "Pendiente"}
                                </button>
                              </td>
                              <td>
                                <span className="font-semibold text-white">{ticket.soldBy?.name || "Desconocido"}</span>
                                <p className="text-[10px] text-gray-500">@{ticket.soldBy?.username}</p>
                              </td>
                              <td className="text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => openEditTicket(ticket)}
                                    className="p-1 px-2.5 rounded bg-blue-950/30 hover:bg-blue-600/80 text-blue-300 hover:text-white border border-blue-500/20 text-xs transition-all"
                                    title="Editar datos de venta"
                                  >
                                    <i className="fas fa-edit"></i> Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTicket(ticket.id, ticket.number)}
                                    className="p-1 px-2.5 rounded bg-red-950/30 hover:bg-red-600/80 text-red-300 hover:text-white border border-red-500/20 text-xs transition-all"
                                    title="Cancelar/Liberar boleto"
                                  >
                                    <i className="fas fa-trash-alt"></i> Cancelar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: USERS */}
            {activeTab === "users" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div className="glass-card p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5BE27] uppercase tracking-wider m-0">
                        <i className="fas fa-users-cog"></i> Control de Integrantes
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Registra nuevos integrantes, promueve roles o remueve cuentas del sistema.</p>
                    </div>

                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="btn btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
                    >
                      <i className="fas fa-user-plus mr-1.5"></i> Agregar Integrante
                    </button>
                  </div>

                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">No hay integrantes registrados.</p>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table text-sm">
                        <thead>
                          <tr>
                            <th>Nombre Completo</th>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Boletos Vendidos</th>
                            <th>Total Cobrado (S/.)</th>
                            <th>Fecha Registro</th>
                            <th className="text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="font-bold text-white">{user.name}</td>
                              <td>@{user.username}</td>
                              <td>
                                <span className={`py-0.5 px-2 rounded text-[10px] font-bold ${
                                  user.role === "ADMIN" 
                                    ? "bg-red-950/40 text-red-400 border border-red-500/20" 
                                    : "bg-blue-950/40 text-blue-400 border border-blue-500/20"
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="font-bold text-center sm:text-left">{user.stats.totalSold}</td>
                              <td className="font-semibold text-emerald-400">S/. {user.stats.paidMoney.toFixed(2)}</td>
                              <td className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td className="text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => handleToggleUserRole(user)}
                                    className="p-1 px-2.5 rounded bg-amber-950/30 hover:bg-amber-600/80 text-amber-300 hover:text-white border border-amber-500/20 text-xs transition-all"
                                    title="Alternar rol (MEMBER/ADMIN)"
                                  >
                                    <i className="fas fa-exchange-alt"></i> Cambiar Rol
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-1 px-2.5 rounded bg-red-950/30 hover:bg-red-600/80 text-red-300 hover:text-white border border-red-500/20 text-xs transition-all"
                                    title="Eliminar cuenta de integrante"
                                  >
                                    <i className="fas fa-trash-alt"></i> Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* MODALS */}

      {/* MODAL 1: REGISTER SALE (ADMIN QUICK REGISTER) */}
      {showRegisterSaleModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="glass-card w-full max-w-md p-8 relative border border-[#F5BE27]/20">
            <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-cart-plus"></i> Registrar Venta (Boleto #{regNumber})
            </h3>
            
            <form onSubmit={handleRegisterSale} className="flex flex-col gap-4 text-sm text-gray-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Nombre del Cliente</label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={regClientName}
                  onChange={(e) => setRegClientName(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Teléfono del Cliente</label>
                <input
                  type="text"
                  placeholder="Número de celular"
                  value={regClientPhone}
                  onChange={(e) => setRegClientPhone(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">Precio (S/.)</label>
                  <input
                    type="number"
                    value={regPrice}
                    onChange={(e) => setRegPrice(parseFloat(e.target.value))}
                    className="glass-input font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-gray-300">
                    <input
                      type="checkbox"
                      checked={regPaid}
                      onChange={(e) => setRegPaid(e.target.checked)}
                      className="w-4 h-4 rounded text-[#F5BE27]"
                    />
                    <span className="text-xs font-semibold">¿Ya pagó?</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Asignar Venta al Integrante</label>
                <select
                  value={regSoldById}
                  onChange={(e) => setRegSoldById(parseInt(e.target.value))}
                  className="glass-input bg-[#111111] border border-white/10 rounded-lg text-white text-xs py-2 px-3"
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterSaleModal(false)}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-2.5"
                >
                  Vender Boleto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TICKET (ADMIN TICKET CONTROLLER) */}
      {showEditTicketModal && editingTicket && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="glass-card w-full max-w-md p-8 relative border border-blue-500/20">
            <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-edit"></i> Editar Boleto #{editingTicket.number}
            </h3>

            <form onSubmit={handleSaveTicket} className="flex flex-col gap-4 text-sm text-gray-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Nombre del Cliente</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Teléfono del Cliente</label>
                <input
                  type="text"
                  value={editClientPhone}
                  onChange={(e) => setEditClientPhone(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">Precio (S/.)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                    className="glass-input font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-gray-300">
                    <input
                      type="checkbox"
                      checked={editPaid}
                      onChange={(e) => setEditPaid(e.target.checked)}
                      className="w-4 h-4 rounded text-[#F5BE27]"
                    />
                    <span className="text-xs font-semibold">¿Ya pagó?</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Vendedor (Integrante)</label>
                <select
                  value={editSoldById}
                  onChange={(e) => setEditSoldById(parseInt(e.target.value))}
                  className="glass-input bg-[#111111] border border-white/10 rounded-lg text-white text-xs py-2 px-3"
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTicketModal(false)}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-2.5"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD USER (ADMIN USER REGISTRATION) */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="glass-card w-full max-w-md p-8 relative border border-[#F5BE27]/20">
            <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-user-plus"></i> Registrar Integrante GC
            </h3>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4 text-sm text-gray-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  placeholder="Ej. jperez"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Contraseña</label>
                <input
                  type="password"
                  placeholder="Contraseña del integrante"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Rol del Integrante</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="glass-input bg-[#111111] border border-white/10 rounded-lg text-white text-xs py-2 px-3"
                  required
                >
                  <option value="MEMBER">Integrante Común (MEMBER)</option>
                  <option value="ADMIN">Administrador Completo (ADMIN)</option>
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="btn btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 py-2.5"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
