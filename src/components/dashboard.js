import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstnace";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CalendarDays,
  BookOpen,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Ticket,
  Users,
  Tag,
  FileText,
  ArrowRight,
  X,
} from "lucide-react";
import "../styles/dashboard.css";

const CHART_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#f43f5e", "#06b6d4"];

const QUICK_LINKS = [
  { path: "/add-tours", label: "Add New Tour", icon: Plus },
  { path: "/manage-bookings", label: "View Bookings", icon: Ticket },
  { path: "/manage-tours", label: "Manage Tours", icon: MapPin },
  { path: "/manage-contact-queries", label: "Contact Queries", icon: MessageSquare },
  { path: "/offers", label: "Manage Coupons", icon: Tag },
  { path: "/manage-users", label: "Manage Users", icon: Users },
  { path: "/manage-blogs", label: "Manage Blogs", icon: FileText },
  { path: "/manage-events", label: "Manage Events", icon: Calendar },
];

function getLast7DaysLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  });
}

function buildBookingTrend(bookings) {
  const labels = getLast7DaysLabels();
  const counts = {};

  labels.forEach((label) => {
    counts[label] = 0;
  });

  bookings.forEach((booking) => {
    const date = new Date(booking.createdAt || booking.bookingDate);
    const label = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (counts[label] !== undefined) {
      counts[label] += 1;
    }
  });

  return labels.map((label) => ({ name: label, bookings: counts[label] }));
}

function buildTourBreakdown(bookings) {
  const tourCounts = {};

  bookings.forEach((booking) => {
    const name = booking.tour_name || "Unknown Tour";
    tourCounts[name] = (tourCounts[name] || 0) + 1;
  });

  return Object.entries(tourCounts)
    .map(([name, value]) => ({ name: name.length > 22 ? `${name.slice(0, 22)}…` : name, value, fullName: name }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      {label && <div className="chart-tooltip__label">{label}</div>}
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name} className="chart-tooltip__value">
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [contactQueries, setContactQueries] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          eventsRes,
          contactRes,
          bookingsCountRes,
          bookingsRes,
          toursRes,
          blogsRes,
        ] = await Promise.allSettled([
          axiosInstance.get("/events/count"),
          axiosInstance.get("/contact/count"),
          axiosInstance.get("/complete-booking/bookings-tour/count"),
          axiosInstance.get("/complete-booking/bookings-tour"),
          axiosInstance.get("/tours"),
          axiosInstance.get("/blogs/count"),
        ]);

        if (eventsRes.status === "fulfilled") {
          setTotalEvents(eventsRes.value.data.count);
        }
        if (contactRes.status === "fulfilled") {
          setContactQueries(contactRes.value.data.count);
        }
        if (bookingsCountRes.status === "fulfilled") {
          setTotalBookings(bookingsCountRes.value.data.count);
        }
        if (bookingsRes.status === "fulfilled") {
          const bookings = bookingsRes.value.data.bookings || bookingsRes.value.data || [];
          const sorted = [...bookings].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setAllBookings(sorted);
          setRecentBookings(sorted.slice(0, 8));
        }
        if (toursRes.status === "fulfilled") {
          const tours = toursRes.value.data.data || toursRes.value.data.tours || toursRes.value.data || [];
          setTotalTours(Array.isArray(tours) ? tours.length : 0);
        }
        if (blogsRes.status === "fulfilled") {
          setTotalBlogs(blogsRes.value.data.count);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const bookingTrend = useMemo(() => buildBookingTrend(allBookings), [allBookings]);
  const tourBreakdown = useMemo(() => buildTourBreakdown(allBookings), [allBookings]);

  const totalRevenue = useMemo(
    () =>
      allBookings.reduce((sum, booking) => {
        const price = Number(booking?.paymentId?.total_price) || 0;
        return sum + price;
      }, 0),
    [allBookings]
  );

  const overviewData = useMemo(
    () =>
      [
        { name: "Bookings", value: totalBookings },
        { name: "Tours", value: totalTours },
        { name: "Events", value: totalEvents },
        { name: "Queries", value: contactQueries },
        { name: "Blogs", value: totalBlogs },
      ].filter((item) => item.value > 0),
    [totalBookings, totalTours, totalEvents, contactQueries, totalBlogs]
  );

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatBookingDate = (booking) => {
    if (!booking?.bookingDate) return "—";
    return `${new Date(booking.bookingDate).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })}${booking.bookingTime ? ` · ${booking.bookingTime}` : ""}`;
  };

  const statCards = [
    {
      label: "Total Bookings",
      value: totalBookings,
      hint: "All tour reservations",
      path: "/manage-bookings",
      icon: BookOpen,
      tone: "blue",
    },
    {
      label: "Active Tours",
      value: totalTours,
      hint: "Published tour listings",
      path: "/manage-tours",
      icon: MapPin,
      tone: "amber",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      hint: "From all bookings",
      path: "/manage-bookings",
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "Contact Queries",
      value: contactQueries,
      hint: "Pending inquiries",
      path: "/manage-contact-queries",
      icon: MessageSquare,
      tone: "purple",
    },
    
    {
      label: "Blog Posts",
      value: totalBlogs,
      hint: "Published articles",
      path: "/manage-blogs",
      icon: FileText,
      tone: "teal",
    },
  ];

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const guest = selectedBooking?.guestId || {};
    const payment = selectedBooking?.paymentId || {};

    const details = [
      { label: "Order ID", value: selectedBooking.customOrderId || selectedBooking._id },
      { label: "Tour Name", value: selectedBooking.tour_name, full: true },
      { label: "Adults", value: selectedBooking.adults },
      { label: "Kids", value: selectedBooking.kids },
      { label: "Cars", value: selectedBooking.number_of_cars },
      {
        label: "Order Status",
        value: selectedBooking.order_status ? "Confirmed" : "Pending",
      },
      { label: "Booking Date", value: formatBookingDate(selectedBooking), full: true },
      { label: "Guest Name", value: `${guest.firstname || ""} ${guest.lastname || ""}`.trim() },
      { label: "Guest Email", value: guest.uemail },
      { label: "Guest Mobile", value: guest.mobile },
      { label: "Payment Status", value: payment.payment_status ? "Paid" : "Unpaid" },
      { label: "Total Price", value: payment.total_price ? `$${payment.total_price}` : "—" },
      { label: "Sub Total", value: payment.sub_total ? `$${payment.sub_total}` : "—" },
      { label: "Discount", value: selectedBooking.discount ?? "—" },
      { label: "Payment Method", value: payment.payment_method },
      {
        label: "Card Detail",
        value: payment.card_detail ? `**** **** **** ${payment.card_detail}` : "—",
      },
      { label: "Transaction ID", value: payment.transactionId, full: true },
      {
        label: "Created At",
        value: payment.createdAt ? payment.createdAt.slice(0, 10) : "—",
      },
    ];

    return (
      <div className="dashboard-detail-grid">
        {details.map((item) => (
          <div
            key={item.label}
            className={`dashboard-detail-item${item.full ? " dashboard-detail-item--full" : ""}`}
          >
            <div className="dashboard-detail-item__label">{item.label}</div>
            <div className="dashboard-detail-item__value">{item.value || "—"}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Dashboard Overview</h1>
          <p className="dashboard-header__subtitle">
            Welcome back! Monitor bookings, revenue, and manage Philly City Tours.
          </p>
        </div>
        <div className="dashboard-header__date">
          <CalendarDays size={16} />
          {todayLabel}
        </div>
      </div>

      <div className="dashboard-stats">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.path} className="dashboard-stat">
              <div className={`dashboard-stat__icon dashboard-stat__icon--${stat.tone}`}>
                <Icon size={22} />
              </div>
              <div>
                <div className="dashboard-stat__label">{stat.label}</div>
                <div className="dashboard-stat__value">{stat.value}</div>
                <div className="dashboard-stat__hint">{stat.hint}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="dashboard-loading">Loading dashboard data…</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Booking Trend</h2>
                  <p className="dashboard-card__subtitle">Last 7 days activity</p>
                </div>
                <Link to="/manage-bookings" className="dashboard-card__link">
                  View all <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={bookingTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#bookingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Platform Overview</h2>
                  <p className="dashboard-card__subtitle">Content distribution</p>
                </div>
              </div>
              {overviewData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={overviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {overviewData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty">No overview data available yet.</div>
              )}
            </div>
          </div>

          <div className="dashboard-grid dashboard-grid--equal">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Top Tours by Bookings</h2>
                  <p className="dashboard-card__subtitle">Most popular tour packages</p>
                </div>
              </div>
              {tourBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={tourBreakdown}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Bookings" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dashboard-empty">No booking data to display yet.</div>
              )}
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Quick Actions</h2>
                  <p className="dashboard-card__subtitle">Frequently used links</p>
                </div>
              </div>
              <div className="dashboard-quick-links">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.path} to={link.path} className="dashboard-quick-link">
                      <span className="dashboard-quick-link__icon">
                        <Icon size={18} />
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="dashboard-card" style={{ marginTop: 20 }}>
        <div className="dashboard-card__header">
          <div>
            <h2 className="dashboard-card__title">Recent Bookings</h2>
            <p className="dashboard-card__subtitle">Latest tour reservations — click a row for details</p>
          </div>
          <Link to="/manage-bookings" className="dashboard-card__link">
            Manage bookings <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
          </Link>
        </div>

        <div className="dashboard-table-wrap">
          {recentBookings.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tour</th>
                  <th>Guest</th>
                  <th>Members</th>
                  <th>Cars</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, i) => (
                  <tr key={booking._id || i} onClick={() => handleRowClick(booking)}>
                    <td>{i + 1}</td>
                    <td>{booking.tour_name}</td>
                    <td>
                      {booking.guestId
                        ? `${booking.guestId.firstname || "Guest"} ${booking.guestId.lastname || ""}`.trim()
                        : "—"}
                    </td>
                    <td>{(booking.adults || 0) + (booking.kids || 0)}</td>
                    <td>{booking.number_of_cars ?? "—"}</td>
                    <td>
                      <span
                        className={`dashboard-badge ${
                          booking.order_status ? "dashboard-badge--success" : "dashboard-badge--warning"
                        }`}
                      >
                        {booking.order_status ? "Confirmed" : "Pending"}
                      </span>
                    </td>
                    <td>{formatBookingDate(booking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="dashboard-empty">No recent bookings found.</div>
          )}
        </div>
      </div>

      {showModal && selectedBooking && (
        <>
          <div className="dashboard-modal-backdrop" onClick={handleCloseModal} />
          <div className="dashboard-modal" role="dialog" aria-modal="true">
            <div className="dashboard-modal__content">
              <div className="dashboard-modal__header">
                <h3 className="dashboard-modal__title">Booking Details</h3>
                <button
                  type="button"
                  className="dashboard-modal__close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="dashboard-modal__body">{renderBookingDetails()}</div>
              <div className="dashboard-modal__footer">
                <button type="button" className="dashboard-btn dashboard-btn--secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
