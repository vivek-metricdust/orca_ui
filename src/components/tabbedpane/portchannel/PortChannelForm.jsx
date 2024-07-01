import React, { useEffect, useState } from "react";
import "../Form.scss";
import { getAllInterfacesOfDeviceURL } from "../../../utils/backend_rest_urls";
import interceptor from "../../../utils/interceptor";
import { useDisableConfig } from "../../../utils/dissableConfigContext";

const PortChannelForm = ({
    onSubmit,
    selectedDeviceIp,
    onCancel,
    handelSubmitButton,
}) => {
    // const [disableSubmit, setDisableSubmit] = useState(handelSubmitButton);
    const { disableConfig, setDisableConfig } = useDisableConfig();

    const instance = interceptor();

    const [selectedInterfaces, setSelectedInterfaces] = useState([]);
    const [interfaceNames, setInterfaceNames] = useState([]);

    const [formData, setFormData] = useState({
        mgt_ip: selectedDeviceIp || "",
        lag_name: "",
        admin_sts: "up",
        mtu: 9100,
        members: "",

        static: true,
        fallback: true,
        fast_rate: true,
        graceful_shutdown_mode: "enable",
        min_links: "",
        ip_address: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);

        if (name === "mtu" && parseInt(value) < 0) {
            return;
        }

        if (value === "true" || value === "false") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value === "true" ? true : false,
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const isValidIPv4WithCIDR = (ipWithCidr) => {
        const ipv4Regex =
            /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;
        const cidrRegex = /^([0-9]|[12][0-9]|3[0-2])$/;

        const [ip, cidr] = ipWithCidr.split("/");

        if (ipv4Regex.test(ip)) {
            if (cidr === undefined || cidrRegex.test(cidr)) {
                return true;
            }
        }
        return false;
    };

    const handleSubmit = (e) => {
        if (
            !isValidIPv4WithCIDR(formData.ip_address) &&
            formData.ip_address !== ""
        ) {
            alert("ip_address is not valid");
            return;
        }

        if (formData.min_links < 1 || formData.min_links > 33) {
            alert("min_links is not valid");
            return;
        }

        onSubmit(formData);
    };

    const handleDropdownChange = (event) => {
        setSelectedInterfaces((prev) => {
            const newValue = event.target.value;
            if (!prev.includes(newValue)) {
                return [...prev, newValue];
            }
            return prev;
        });
    };

    const handleRemove = (key) => {
        setSelectedInterfaces((prev) => {
            return prev.filter((item) => item !== key);
        });

        setDisableConfig(false);
    };

    const handleValue = (e) => {
        if (!/^PortChannel\d+$/.test(e.target.value)) {
            alert(
                'Invalid lag_name format. It should follow the pattern "PortChannel..." where "..." is a numeric value.'
            );
            return;
        }
    };

    useEffect(() => {
        instance
            .get(getAllInterfacesOfDeviceURL(selectedDeviceIp))
            .then((response) => {
                const fetchedInterfaceNames = response.data
                    .map((item) => item.name)
                    .filter((item) => item.includes("Ethernet"));
                setInterfaceNames(fetchedInterfaceNames);
            })
            .catch((error) => {
                console.error("Error fetching interface names", error);
            });
    }, []);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(formData);
            }}
            className=""
        >
            <div className="form-wrapper">
                <div className="form-field w-50">
                    <label>Device IP:</label>
                    <input type="text" value={selectedDeviceIp} disabled />
                </div>
                <div className="form-field w-50">
                    <label htmlFor="lag-name">Channel Name:</label>
                    <input
                        type="text"
                        name="lag_name"
                        value={formData.lag_name}
                        onChange={handleChange}
                        onBlur={handleValue}
                    />
                </div>
            </div>

            <div className="form-wrapper">
                <div className="form-field w-50">
                    <label>Admin Status:</label>
                    <select
                        name="admin_sts"
                        value={formData.admin_sts}
                        onChange={handleChange}
                        defaultValue={"up"}
                    >
                        <option selected value="up">
                            up
                        </option>
                        <option value="down">down</option>
                    </select>
                </div>
                <div className="form-field w-50">
                    <label>MTU:</label>
                    <input
                        type="number"
                        name="mtu"
                        value={formData.mtu}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-wrapper">
                <div className="form-field w-50">
                    <label> Static:</label>
                    <select
                        name="static"
                        value={formData.static}
                        onChange={handleChange}
                        defaultValue={true}
                    >
                        <option selected value={true}>
                            True
                        </option>
                        <option value={false}>False</option>
                    </select>
                </div>
                <div className="form-field w-50">
                    <label>Fallback:</label>
                    <select
                        name="fallback"
                        value={formData.fallback}
                        onChange={handleChange}
                        defaultValue={true}
                    >
                        <option selected value={true}>
                            True
                        </option>
                        <option value={false}>False</option>
                    </select>
                </div>
            </div>

            <div className="form-wrapper">
                <div className="form-field w-50">
                    <label> Fast Rate:</label>
                    <select
                        name="fast_rate"
                        value={formData.fast_rate}
                        onChange={handleChange}
                        defaultValue={true}
                    >
                        <option selected value={true}>
                            True
                        </option>
                        <option value={false}>False</option>
                    </select>
                </div>
                <div className="form-field w-50">
                    <label>Graceful Shutdown Mode:</label>
                    <select
                        name="graceful_shutdown_mode"
                        value={formData.graceful_shutdown_mode}
                        onChange={handleChange}
                        defaultValue={"enable"}
                    >
                        <option selected value="enable">
                            Enable
                        </option>
                        <option value="disable">Disable</option>
                    </select>
                </div>
            </div>

            <div className="form-wrapper">
                <div className="form-field w-50">
                    <label>
                        Min Link <span className="note">(1-32)</span> :
                    </label>
                    <input
                        type="number"
                        max={32}
                        min={1}
                        name="min_links"
                        value={formData.min_links}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field w-50">
                    <label>Ip Address:</label>
                    <input
                        type="text"
                        name="ip_address"
                        value={formData.ip_address}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-field">
                <label>Description</label>
                <textarea
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                ></textarea>
            </div>

            <div className="form-wrapper">
                <div className="form-field w-75">
                    <label>Members:</label>
                    <select
                        onChange={handleDropdownChange}
                        defaultValue={"DEFAULT"}
                    >
                        <option value="DEFAULT" disabled>
                            Select Member Interface
                        </option>
                        {interfaceNames.map((member) => (
                            <option key={member} value={member}>
                                {member}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-field mt-25">
                    {Object.keys(selectedInterfaces).length} selected
                </div>
            </div>

            <div className="selected-interface-wrap mb-10 w-100">
                {Object.entries(selectedInterfaces).map(
                    ([key, value], index) => (
                        <div className="selected-interface-list mb-10">
                            <div key={key} className="ml-10 w-50">
                                {index + 1} &nbsp; {value}
                            </div>
                            <div className=" w-50">
                                <button
                                    className="btnStyle ml-25"
                                    disabled={disableConfig}
                                    onClick={() => handleRemove(value)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="">
                <button
                    type="submit"
                    className="btnStyle mr-10"
                    disabled={disableConfig}
                >
                    Apply Config
                </button>
                <button
                    type="button"
                    className="btnStyle mr-10"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default PortChannelForm;
