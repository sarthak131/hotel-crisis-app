import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-card">
       <h1 className="brand-title">Oberoi Hotels</h1>

<p className="tagline">
  Luxury.  Safety.  Seamless  Experience.
</p>

        <div className="btn-group">
          <button className="btn primary" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="btn secondary" onClick={() => navigate("/booking")}>
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
}