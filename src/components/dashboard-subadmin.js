import { useEffect } from "react";
import { useState } from "react";
import { Card, Button, ProgressBar, Badge, Row, Col } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstnace";
import { Link } from "react-router-dom";

const BLOG_TARGET = 3;
const TESTIMONIAL_TARGET = 10;
const FAQ_TARGET = 50;

const DashboardSubAdmin = () => {
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [recentBlogs, setRecentBlogs] = useState([]);
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs");

        const sortedBlogs = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentBlogs(sortedBlogs);
      } catch (err) {
        console.error("Error fetching recent blogs:", err);
      }
    };

    fetchRecentBlogs();
  }, []);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs/count");
        setTotalBlogs(response.data.count);
      } catch (error) {
        console.error("Error fetching total blogs:", error);
      }
    };
    fetchBlogs();
  }, []);
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axiosInstance.get("/testimonials/count");
        setTotalTestimonials(response.data.count);
      } catch (error) {
        console.error("Error fetching total testimonials:", error);
      }
    };
    fetchTestimonials();
  }, []);
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get("/faqs/count");
        setTotalFaqs(response.data.count);
      } catch (error) {
        console.error("Error fetching total faqs:", error);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="heading">Welcome Sub Admin</h1>
      <Row className="mb-4">
        <Col md={4}>
          <Link to="/manage-blogs" style={{ textDecoration: "none" }}>
            <Card className="text-center p-3">
              <h2 className="heading-cards">Blogs</h2>
              <h4>{totalBlogs}</h4>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  Target: <b>{BLOG_TARGET} Blogs</b>
                </div>
                <div>
                  Duration: <b>1 Month</b>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <ProgressBar
                  now={Math.min((totalBlogs / BLOG_TARGET) * 100, 100)}
                  className="w-50 me-2"
                  variant="info"
                />
                <ProgressBar
                  now={Math.min((totalBlogs / BLOG_TARGET) * 100, 100)}
                  className="w-50"
                  variant="secondary"
                />
              </div>
            </Card>
          </Link>
        </Col>

        <Col md={4}>
          <Link to="/manage-testimonials" style={{ textDecoration: "none" }}>
            <Card className="text-center p-3">
              <h2 className="heading-cards">Testimonials</h2>
              <h4>{totalTestimonials}</h4>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  Target: <b>{TESTIMONIAL_TARGET}</b>
                </div>
                <div>
                  Duration: <b>One Time</b>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <ProgressBar
                  now={Math.min(
                    (totalTestimonials / TESTIMONIAL_TARGET) * 100,
                    100
                  )}
                  className="w-50 me-2"
                  variant="info"
                />
                <ProgressBar
                  now={Math.min(
                    (totalTestimonials / TESTIMONIAL_TARGET) * 100,
                    100
                  )}
                  className="w-50"
                  variant="primary"
                />
              </div>
            </Card>
          </Link>
        </Col>

        <Col md={4}>
          <Link to="/manage-faqs" style={{ textDecoration: "none" }}>
            <Card className="text-center p-3">
              <h2 className="heading-cards">Faqs</h2>
              <h4>{totalFaqs}</h4>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  Target: <b>{FAQ_TARGET}</b>
                </div>
                <div>
                  Duration: <b>One Time</b>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <ProgressBar
                  now={Math.min((totalFaqs / FAQ_TARGET) * 100, 100)}
                  className="w-50 me-2"
                  variant="info"
                />
                <ProgressBar
                  now={Math.min((totalFaqs / FAQ_TARGET) * 100, 100)}
                  className="w-50"
                  variant="secondary"
                />
              </div>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Rating & Users */}
      <Row>
        <Col md={12}>
          <Card className="p-3">
            <h5>Recent Blogs</h5>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Summary</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBlogs.map((blog, i) => (
                    <tr key={blog._id || i}>
                      <td>{i + 1}</td>
                      <td>{blog.blogName}</td>
                      <td>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: blog.blogDesc
                              ? blog.blogDesc
                                  .split(" ")
                                  .slice(0, 10)
                                  .join(" ") + "..."
                              : "No summary available.",
                          }}
                        />
                      </td>
                      <td>{new Date(blog.createdAt).toLocaleString()}</td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          as="a"
                          href={`/manage-blogs`}
                        >
                          View Blog
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSubAdmin;
