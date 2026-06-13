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
  FileText,
  MessageSquareQuote,
  HelpCircle,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  Eye,
  PenLine,
} from "lucide-react";
import "../styles/dashboard.css";

const BLOG_TARGET = 5;
const TESTIMONIAL_TARGET = 10;
const FAQ_TARGET = 50;

const CHART_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#f43f5e"];

const QUICK_LINKS = [
  { path: "/add-blogs", label: "Add New Blog", icon: Plus },
  { path: "/manage-blogs", label: "Manage Blogs", icon: FileText },
  { path: "/add-tours", label: "Add New Tour", icon: Plus },
  { path: "/manage-tours", label: "Manage Tours", icon: MapPin },
  { path: "/add-events", label: "Add Event", icon: Plus },
  { path: "/manage-events", label: "Manage Events", icon: Calendar },
  { path: "/add-testimonials", label: "Add Testimonial", icon: PenLine },
  { path: "/add-faqs", label: "Add FAQ", icon: HelpCircle },
];

function getLast7DaysLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  });
}

function buildContentTrend(items) {
  const labels = getLast7DaysLabels();
  const counts = {};
  labels.forEach((label) => {
    counts[label] = 0;
  });

  items.forEach((item) => {
    const date = new Date(item.createdAt);
    const label = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (counts[label] !== undefined) {
      counts[label] += 1;
    }
  });

  return labels.map((label) => ({ name: label, content: counts[label] }));
}

function getProgressPercent(current, target) {
  return Math.min(Math.round((current / target) * 100), 100);
}

function stripHtml(html) {
  if (!html) return "No summary available.";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

function ProgressStat({ label, value, target, duration, path, icon: Icon, tone, fillClass }) {
  const percent = getProgressPercent(value, target);

  return (
    <Link to={path} className="dashboard-stat dashboard-stat--progress">
      <div className="dashboard-stat__top">
        <div className={`dashboard-stat__icon dashboard-stat__icon--${tone}`}>
          <Icon size={22} />
        </div>
        <div>
          <div className="dashboard-stat__label">{label}</div>
          <div className="dashboard-stat__value">{value}</div>
          <div className="dashboard-stat__hint">Target: {target} · {duration}</div>
        </div>
      </div>
      <div className="dashboard-progress">
        <div className="dashboard-progress__meta">
          <span>
            Progress: <strong>{value} / {target}</strong>
          </span>
          <span>{percent}%</span>
        </div>
        <div className="dashboard-progress__bar">
          <div
            className={`dashboard-progress__fill ${fillClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function DashboardSubAdmin() {
  const [loading, setLoading] = useState(true);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [allContentItems, setAllContentItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          blogsCountRes,
          testimonialsCountRes,
          faqsCountRes,
          blogsRes,
          toursRes,
          eventsRes,
          testimonialsRes,
          faqsRes,
        ] = await Promise.allSettled([
          axiosInstance.get("/blogs/count"),
          axiosInstance.get("/testimonials/count"),
          axiosInstance.get("/faqs/count"),
          axiosInstance.get("/blogs"),
          axiosInstance.get("/tours"),
          axiosInstance.get("/events/count"),
          axiosInstance.get("/testimonials"),
          axiosInstance.get("/faqs"),
        ]);

        if (blogsCountRes.status === "fulfilled") {
          setTotalBlogs(blogsCountRes.value.data.count);
        }
        if (testimonialsCountRes.status === "fulfilled") {
          setTotalTestimonials(testimonialsCountRes.value.data.count);
        }
        if (faqsCountRes.status === "fulfilled") {
          setTotalFaqs(faqsCountRes.value.data.count);
        }
        if (toursRes.status === "fulfilled") {
          const tours = toursRes.value.data.data || toursRes.value.data || [];
          setTotalTours(Array.isArray(tours) ? tours.length : 0);
        }
        if (eventsRes.status === "fulfilled") {
          setTotalEvents(eventsRes.value.data.count);
        }

        const contentItems = [];
        if (blogsRes.status === "fulfilled") {
          const blogs = blogsRes.value.data || [];
          const sorted = [...blogs].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setRecentBlogs(sorted.slice(0, 8));
          contentItems.push(...sorted);
        }
        if (testimonialsRes.status === "fulfilled") {
          contentItems.push(...(testimonialsRes.value.data || []));
        }
        if (faqsRes.status === "fulfilled") {
          contentItems.push(...(faqsRes.value.data || []));
        }
        setAllContentItems(contentItems);
      } catch (error) {
        console.error("Error fetching subadmin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const contentTrend = useMemo(
    () => buildContentTrend(allContentItems),
    [allContentItems]
  );

  const overviewData = useMemo(
    () =>
      [
        { name: "Blogs", value: totalBlogs },
        { name: "Testimonials", value: totalTestimonials },
        { name: "FAQs", value: totalFaqs },
        { name: "Tours", value: totalTours },
        { name: "Events", value: totalEvents },
      ].filter((item) => item.value > 0),
    [totalBlogs, totalTestimonials, totalFaqs, totalTours, totalEvents]
  );

  const goalProgressData = useMemo(
    () => [
      {
        name: "Blogs",
        current: totalBlogs,
        target: BLOG_TARGET,
        remaining: Math.max(BLOG_TARGET - totalBlogs, 0),
      },
      {
        name: "Testimonials",
        current: totalTestimonials,
        target: TESTIMONIAL_TARGET,
        remaining: Math.max(TESTIMONIAL_TARGET - totalTestimonials, 0),
      },
      {
        name: "FAQs",
        current: totalFaqs,
        target: FAQ_TARGET,
        remaining: Math.max(FAQ_TARGET - totalFaqs, 0),
      },
    ],
    [totalBlogs, totalTestimonials, totalFaqs]
  );

  const overallProgress = useMemo(() => {
    const totalCurrent = totalBlogs + totalTestimonials + totalFaqs;
    const totalTarget = BLOG_TARGET + TESTIMONIAL_TARGET + FAQ_TARGET;
    return getProgressPercent(totalCurrent, totalTarget);
  }, [totalBlogs, totalTestimonials, totalFaqs]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Sub Admin Dashboard</h1>
          <p className="dashboard-header__subtitle">
            Track your content goals, manage tours, and monitor recent activity.
          </p>
        </div>
        <div className="dashboard-header__date">
          <CalendarDays size={16} />
          {todayLabel}
        </div>
      </div>

      <div className="dashboard-stats">
        <ProgressStat
          label="Blogs"
          value={totalBlogs}
          target={BLOG_TARGET}
          duration="1 Month"
          path="/manage-blogs"
          icon={FileText}
          tone="amber"
          fillClass="dashboard-progress__fill--amber"
        />
        <ProgressStat
          label="Testimonials"
          value={totalTestimonials}
          target={TESTIMONIAL_TARGET}
          duration="One Time"
          path="/manage-testimonials"
          icon={MessageSquareQuote}
          tone="blue"
          fillClass="dashboard-progress__fill--blue"
        />
        <ProgressStat
          label="FAQs"
          value={totalFaqs}
          target={FAQ_TARGET}
          duration="One Time"
          path="/manage-faqs"
          icon={HelpCircle}
          tone="purple"
          fillClass="dashboard-progress__fill--purple"
        />
      </div>

      <div className="dashboard-stats" style={{ marginTop: 0 }}>
        <Link to="/manage-tours" className="dashboard-stat">
          <div className="dashboard-stat__icon dashboard-stat__icon--green">
            <MapPin size={22} />
          </div>
          <div>
            <div className="dashboard-stat__label">Active Tours</div>
            <div className="dashboard-stat__value">{totalTours}</div>
            <div className="dashboard-stat__hint">Tour listings you manage</div>
          </div>
        </Link>
        <Link to="/manage-events" className="dashboard-stat">
          <div className="dashboard-stat__icon dashboard-stat__icon--rose">
            <Calendar size={22} />
          </div>
          <div>
            <div className="dashboard-stat__label">Events</div>
            <div className="dashboard-stat__value">{totalEvents}</div>
            <div className="dashboard-stat__hint">Scheduled events</div>
          </div>
        </Link>
        <div className="dashboard-stat" style={{ cursor: "default" }}>
          <div className="dashboard-stat__icon dashboard-stat__icon--teal">
            <PenLine size={22} />
          </div>
          <div>
            <div className="dashboard-stat__label">Overall Goal Progress</div>
            <div className="dashboard-stat__value">{overallProgress}%</div>
            <div className="dashboard-stat__hint">Combined blogs, testimonials & FAQs</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">Loading dashboard data…</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Content Activity</h2>
                  <p className="dashboard-card__subtitle">New content added in the last 7 days</p>
                </div>
                <Link to="/manage-blogs" className="dashboard-card__link">
                  View blogs <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={contentTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="contentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
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
                    dataKey="content"
                    name="Items Added"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#contentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Content Overview</h2>
                  <p className="dashboard-card__subtitle">Your content distribution</p>
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
                <div className="dashboard-empty">No content data available yet.</div>
              )}
            </div>
          </div>

          <div className="dashboard-grid dashboard-grid--equal">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2 className="dashboard-card__title">Goal Progress</h2>
                  <p className="dashboard-card__subtitle">Current vs remaining targets</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={goalProgressData}
                  margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
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
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="current" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="remaining" name="Remaining" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
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
                    <Link key={link.path + link.label} to={link.path} className="dashboard-quick-link">
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
            <h2 className="dashboard-card__title">Recent Blogs</h2>
            <p className="dashboard-card__subtitle">Latest blog posts you've published</p>
          </div>
          <Link to="/manage-blogs" className="dashboard-card__link">
            Manage blogs <ArrowRight size={14} style={{ verticalAlign: "middle" }} />
          </Link>
        </div>

        <div className="dashboard-table-wrap">
          {recentBlogs.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Summary</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBlogs.map((blog, i) => (
                  <tr key={blog._id || i}>
                    <td>{i + 1}</td>
                    <td>{blog.blogName}</td>
                    <td>
                      {stripHtml(blog.blogDesc).split(" ").slice(0, 12).join(" ")}
                      {stripHtml(blog.blogDesc).split(" ").length > 12 ? "…" : ""}
                    </td>
                    <td>{new Date(blog.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}</td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="dashboard-empty">No blog posts found yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSubAdmin;
