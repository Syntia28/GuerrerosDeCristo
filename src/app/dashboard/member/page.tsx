"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ticket {
  id: number;
  number: number;
  clientName: string;
  clientPhone: string;
  price: number;
  paid: boolean;
  soldBy: {
    name: string;
  };
  soldAt: string;
}

export default function MemberDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  // Form Fields
  const [selectedNums, setSelectedNums] = useState<number[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [price, setPrice] = useState(0);
  const [paid, setPaid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPrice(selectedNums.length * 5);
  }, [selectedNums]);

  // Stats
  const [stats, setStats] = useState({
    totalSold: 0,
    totalMoney: 0,
    pendingMoney: 0,
  });

  // Limit of tickets in the raffle (e.g. 100 tickets)
  const TOTAL_TICKETS = 2000;
  const soldNumbers = tickets.map((t) => t.number);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        const ticketList = data.tickets || [];
        setTickets(ticketList);

        // Compute Stats
        let sold = ticketList.length;
        let money = 0;
        let pending = 0;
        ticketList.forEach((t: Ticket) => {
          if (t.paid) {
            money += t.price;
          } else {
            pending += t.price;
          }
        });
        setStats({ totalSold: sold, totalMoney: money, pendingMoney: pending });
      } else {
        setError("Error al obtener los boletos vendidos.");
      }
    } catch (err) {
      setError("Error de red al sincronizar boletos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNums.length === 0) {
      setError("Por favor, selecciona al menos un número de boleto.");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: selectedNums,
          clientName,
          clientPhone,
          price,
          paid
        })
      });

      const data = await res.json();
      if (res.ok) {
        const label = selectedNums.length === 1 ? `Boleto #${selectedNums[0]}` : `Boletos #${selectedNums.sort((a,b)=>a-b).join(", #")}`;
        setSuccessMsg(`¡${label} registrado(s) con éxito!`);
        // Reset form
        setSelectedNums([]);
        setClientName("");
        setClientPhone("");
        setPaid(false);
        // Refresh
        fetchTickets();
      } else {
        setError(data.error || "No se pudo registrar el boleto.");
      }
    } catch (err) {
      setError("Error al registrar la venta.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePaid = async (ticket: Ticket) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !ticket.paid })
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Error toggling paid state:", err);
    }
  };

  const handleDeleteTicket = async (ticketId: number, num: number) => {
    if (!confirm(`¿Estás seguro de cancelar la venta del boleto #${num}?`)) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccessMsg(`Venta del boleto #${num} cancelada.`);
        fetchTickets();
      } else {
        setError("No se pudo cancelar la venta.");
      }
    } catch (err) {
      setError("Error al eliminar la venta.");
    }
  };

  return (
    <div className="gradient-bg min-h-screen text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[#F5BE27]/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#F5BE27]">Panel del Integrante</h1>
            <p className="text-gray-400 text-sm mt-1">Registra ventas de rifas y gestiona el estado de cobros.</p>
          </div>
          <button
            onClick={fetchTickets}
            className="btn btn-outline py-2 px-4 text-xs mt-4 md:mt-0 flex gap-2 items-center self-start"
          >
            <i className="fas fa-sync-alt"></i> Sincronizar Datos
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-sm flex gap-2 items-center">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex gap-2 items-center animate-fadeIn">
            <i className="fas fa-check-circle"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col items-center">
            <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Rifas Vendidas</span>
            <span className="text-4xl font-extrabold text-[#F5BE27]">{stats.totalSold} / {TOTAL_TICKETS}</span>
            <div className="w-full bg-black/40 h-2.5 rounded-full mt-4 overflow-hidden border border-white/5">
              <div
                className="bg-[#F5BE27] h-full rounded-full transition-all"
                style={{ width: `${(stats.totalSold / TOTAL_TICKETS) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="glass-card p-6 flex flex-col items-center">
            <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Recaudado (Pagado)</span>
            <span className="text-4xl font-extrabold text-emerald-400">S/. {stats.totalMoney.toFixed(2)}</span>
            <span className="text-xs text-gray-500 mt-2 font-medium">Efectivo en caja / entregado</span>
          </div>
          <div className="glass-card p-6 flex flex-col items-center">
            <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-2">Pendiente por Cobrar</span>
            <span className="text-4xl font-extrabold text-amber-500">S/. {stats.pendingMoney.toFixed(2)}</span>
            <span className="text-xs text-gray-500 mt-2 font-medium">Compromisos pendientes</span>
          </div>
        </div>

        {/* Forms and Selector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Visual Selector Grid (Left/Main Column) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#F5BE27] mb-2 uppercase tracking-wider">
                <i className="fas fa-th"></i> Mapa de Boletos Disponibles
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Los números en <span className="text-[#f87171] font-semibold">rojo</span> ya están vendidos. Los números en <span className="text-[#34d399] font-semibold">verde</span> están libres, haz clic en uno para seleccionarlo.
              </p>

              {loading ? (
                <div className="py-20 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                  <p className="mt-2 text-sm">Cargando números...</p>
                </div>
              ) : (
                <div className="ticket-selector-grid">
                  {Array.from({ length: TOTAL_TICKETS }, (_, idx) => {
                    const num = idx + 1;
                    const isSold = soldNumbers.includes(num);
                    const isSelected = selectedNums.includes(num);

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (!isSold) {
                            setSelectedNums((prev) =>
                              prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
                            );
                          }
                        }}
                        className={`ticket-number-btn ${isSold
                            ? "ticket-btn-sold"
                            : isSelected
                              ? "ticket-btn-selected"
                              : "ticket-btn-available"
                          }`}
                        disabled={isSold}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Register Sale Form (Right Column) */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-[#F5BE27] mb-4 uppercase tracking-wider">
                <i className="fas fa-plus-circle"></i> Registrar Nueva Venta
              </h3>

              <form onSubmit={handleRegisterSale} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">Boletos Seleccionados</label>
                  <input
                    type="text"
                    value={selectedNums.sort((a, b) => a - b).join(", ")}
                    placeholder="Elige uno o más números del mapa de la izquierda"
                    className="glass-input text-[#F5BE27] font-bold"
                    readOnly
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">Nombre del Cliente</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">Teléfono del Cliente</label>
                  <input
                    type="text"
                    placeholder="Número de celular"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300">Precio Total (S/.)</label>
                    <input
                      type="number"
                      value={price}
                      className="glass-input font-bold"
                      readOnly
                      required
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-gray-300 select-none">
                      <input
                        type="checkbox"
                        checked={paid}
                        onChange={(e) => setPaid(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#F5BE27] focus:ring-[#F5BE27]"
                      />
                      <span>¿Ya pagó?</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary w-full py-3 mt-2"
                >
                  {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : "Confirmar Registro"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-[#F5BE27] uppercase tracking-wider m-0">
              <i className="fas fa-list-alt"></i> Registro y Detalle de Ventas
            </h3>
            <div className="relative w-full sm:w-60">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Buscar por número o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-9 text-xs py-2 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <p className="mt-2 text-sm">Cargando tabla...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Aún no se han registrado ventas de rifas.
            </div>
          ) : (
            (() => {
              const filteredTickets = tickets.filter((t) => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return true;
                return (
                  t.number.toString().includes(query) ||
                  t.clientName.toLowerCase().includes(query) ||
                  t.clientPhone.includes(query)
                );
              });

              if (filteredTickets.length === 0) {
                return (
                  <div className="py-10 text-center text-gray-500 text-sm">
                    No se encontraron ventas con los filtros indicados.
                  </div>
                );
              }

              return (
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Boleto</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Precio</th>
                        <th>¿Pagado?</th>
                        <th>Registrado Por</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="font-extrabold text-[#F5BE27]">#{ticket.number}</td>
                          <td className="font-semibold text-white">{ticket.clientName}</td>
                          <td>{ticket.clientPhone}</td>
                          <td className="font-medium">S/. {ticket.price.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(ticket)}
                              className={`py-1 px-3 rounded-full text-xs font-bold border transition-all ${ticket.paid
                                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500 hover:text-white"
                                  : "bg-amber-950/30 text-amber-400 border-amber-500/40 hover:bg-amber-500 hover:text-white"
                                }`}
                            >
                              <i className={`fas ${ticket.paid ? "fa-check-circle" : "fa-clock"} mr-1`}></i>
                              {ticket.paid ? "Pagado" : "Pendiente"}
                            </button>
                          </td>
                          <td className="text-gray-400 text-xs">{ticket.soldBy?.name || "Desconocido"}</td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteTicket(ticket.id, ticket.number)}
                              className="p-1 px-2 rounded bg-red-950/30 hover:bg-red-600/80 text-red-300 hover:text-white border border-red-500/20 text-xs transition-all"
                              title="Cancelar Venta"
                            >
                              <i className="fas fa-trash-alt"></i> Cancelar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </div>

      </div>
    </div>
  );
}
