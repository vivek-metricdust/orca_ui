import "./sidebar.scss";
import StorageIcon from "@mui/icons-material/Storage";
import { Link } from "react-router-dom";
import logo from "../../assets/orca.png";
import { useNavigate } from "react-router-dom";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <div className="top">
                <Link to="/home" style={{ textDecoration: "none" }}>
                    <img src={logo} className="logo" alt="logo.png" />
                </Link>
            </div>
            <hr />
            <div className="center">
                <Link className="navLink" to="/home">
                    <StorageIcon className="icon" />
                    <span>Devices</span>
                </Link>
                <Link className="navLink" to="/orcAsk">
                    <SmartToyIcon className="icon" />
                    <span>OrcAsk</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
