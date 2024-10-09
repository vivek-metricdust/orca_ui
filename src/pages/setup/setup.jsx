import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from "react";

import {
    deviceUserColumns,
    defaultColDef,
} from "../../components/tabbedpane/datatablesourse";
import interceptor from "../../utils/interceptor";
import {
    getAllDevicesURL,
    installSonicURL,
} from "../../utils/backend_rest_urls";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { areAllIPAddressesValid } from "../../utils/common";
import useStoreLogs from "../../utils/store";
import useStoreConfig from "../../utils/configStore";

export const Home = () => {
    const instance = interceptor();

    const setUpdateLog = useStoreLogs((state) => state.setUpdateLog);

    const setUpdateConfig = useStoreConfig((state) => state.setUpdateConfig);
    const updateConfig = useStoreConfig((state) => state.updateConfig);

    const [dataTable, setDataTable] = useState([]);
    const gridRef = useRef();
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const [networkList, setNetworkList] = useState({});

    const [selectedNetworkDevices, setSelectedNetworkDevices] = useState([]);

    const [formData, setFormData] = useState({
        image_url: "",
        device_ips: "",
        discover_also: false,
        user_name: "",
        password: "",
    });

    const [selectedDevices, setSelectedDevices] = useState([]);

    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        getDevices();
    }, []);

    const getDevices = () => {
        setDataTable([]);
        instance(getAllDevicesURL())
            .then((res) => {
                setDataTable(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data.mgt_ip);

        setSelectedDevices(selectedData);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "device_ips" && value) {
            value = value
                .trim()
                .split(",")
                .map((ip) => ip.trim());

            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleCheckbox = (e) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            discover_also: e.target.checked,
        }));
    };

    const handelNetworkChecked = (event, ip) => {
        setSelectedNetworkDevices((prevSelectedNetworkDevices) => {
            if (event.target.checked) {
                return [
                    ...prevSelectedNetworkDevices,
                    {
                        image_url: formData.image_url,
                        device_ips: [ip],
                        discover_also: false,
                        user_name: formData.user_name,
                        password: formData.password,
                    },
                ];
            } else {
                return prevSelectedNetworkDevices.filter(
                    (item) => item.device_ips[0] !== ip
                );
            }
        });
    };

    const handelNetworkDiscoveryChecked = (e, ip) => {
        selectedNetworkDevices.forEach((item) => {
            if (item.device_ips[0] === ip) {
                item.discover_also = e.target.checked;
            }
        });
        setSelectedNetworkDevices([...selectedNetworkDevices]);
    };

    const discoverDisabled = (e) => {
        let result = selectedNetworkDevices.some((item) =>
            item.device_ips.includes(e)
        );
        return !result;
    };

    const selectAllIp = (e) => {
        if (e.target.checked) {
            const result = [];

            Object.keys(networkList).forEach((network) => {
                networkList[network].forEach((entry) => {
                    result.push({
                        image_url: formData.image_url,
                        device_ips: [entry.ip],
                        discover_also: false,
                        user_name: formData.user_name,
                        password: formData.password,
                    });
                });
            });
            setSelectedNetworkDevices(result);
            setSelectAll(true);
        } else {
            setSelectedNetworkDevices([]);
            setSelectAll(false);
        }
    };

    const selectDiscoverAll = (e) => {
        setSelectedNetworkDevices(
            selectedNetworkDevices.map((item) => {
                return {
                    ...item,
                    discover_also: e.target.checked,
                };
            })
        );
    };

    const send_update = () => {
        let isValid = false;
        if (formData.device_ips.length > 0) {
            formData.device_ips.forEach((element) => {
                if (areAllIPAddressesValid(element)) {
                    isValid = true;
                } else {
                    isValid = false;
                    alert("Invalid IP Address");
                    return;
                }
            });
        } else {
            isValid = true;
        }

        if (isValid) {
            let payload = {
                image_url: formData.image_url,
                device_ips: [...formData.device_ips, ...selectedDevices],
                discover_also: formData.discover_also,
                user_name: formData.user_name,
                password: formData.password,
            };
            installImage(payload);
        }
    };

    const applyConfig = () => {
        installImage(selectedNetworkDevices);
    };

    const installImage = async (payload) => {
        try {
            const response = await instance.put(installSonicURL(), payload);
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            setUpdateLog(true);
            setUpdateConfig(false);
        }
    };

    return (
        <div>
            <div className="listContainer resizable">
                <div className="form-wrapper align-center ">
                    <div className="form-field w-25">
                        <label>SONiC Image URL : </label>
                    </div>
                    <div className="form-field w-75">
                        <input
                            type="text"
                            name="image_url"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-wrapper align-center">
                    <div className="form-field w-25">
                        <label>User Name : </label>
                    </div>
                    <div className="form-field w-25">
                        <input
                            type="text"
                            name="user_name"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field w-25">
                        <label> Password : </label>
                    </div>
                    <div className="form-field w-25">
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-field w-100">
                    <small>
                        NOTE: The user name and password is for SONiC image
                        specific
                    </small>
                </div>

                <div className="form-wrapper align-center">
                    <div className="form-field w-25">
                        <label>ONIE Devices for SONiC installation : </label>
                    </div>
                    <div className="form-field w-50">
                        <input
                            type="text"
                            name="device_ips"
                            onChange={handleChange}
                            placeholder="Give one or more IP address or ONIE device address separated by comma"
                        />
                    </div>
                    <div className="form-field w-25">
                        <div style={{ display: "flex" }}>
                            <label className="">Discover also </label>
                            <input
                                type="checkbox"
                                className="ml-15"
                                checked={formData.discover_also}
                                onChange={handleCheckbox}
                            />
                        </div>
                    </div>
                </div>

                <div className="listTitle">
                    Select Devices for SONiC installation
                </div>
                <div className="">
                    <div style={gridStyle} className="ag-theme-alpine">
                        <AgGridReact
                            ref={gridRef}
                            rowData={dataTable}
                            columnDefs={deviceUserColumns("setup")}
                            defaultColDef={defaultColDef}
                            domLayout={"autoHeight"}
                            enableCellTextSelection="true"
                            rowSelection="multiple"
                            onSelectionChanged={onSelectionChanged}
                        ></AgGridReact>
                    </div>
                </div>

                <div>
                    <button className="btnStyle mt-15" onClick={send_update}>
                        Update SONiC on Devices Selected
                    </button>
                </div>
            </div>

            {Object.keys(networkList).length > 0 && (
                <div className="listContainer resizable">
                    <div className="listTitle">
                        Following ONIE devices identified from the repective
                        networks provided for SONiC installation
                    </div>

                    <div className="p-5 ">
                        <table
                            border="1"
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Network Address</th>
                                    <th>IP Address</th>
                                    <th>
                                        Select All
                                        <input
                                            className="ml-10"
                                            type="checkbox"
                                            onChange={(e) => {
                                                selectAllIp(e);
                                            }}
                                        />
                                    </th>
                                    <th>
                                        Discover All
                                        <input
                                            className="ml-10"
                                            type="checkbox"
                                            disabled={!selectAll}
                                            onChange={(e) => {
                                                selectDiscoverAll(e);
                                            }}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(networkList).map((key) => (
                                    <React.Fragment key={key}>
                                        {networkList[key].map(
                                            (entry, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {index === 0 ? (
                                                        <td
                                                            rowSpan={
                                                                networkList[key]
                                                                    .length
                                                            }
                                                        >
                                                            {key}
                                                        </td>
                                                    ) : null}
                                                    <td>{entry.ip}</td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            disabled={selectAll}
                                                            checked={
                                                                selectedNetworkDevices.filter(
                                                                    (item) =>
                                                                        item
                                                                            .device_ips[0] ===
                                                                        entry.ip
                                                                ).length > 0
                                                            }
                                                            onChange={(e) => {
                                                                handelNetworkChecked(
                                                                    e,
                                                                    entry.ip
                                                                );
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            disabled={discoverDisabled(
                                                                entry.ip
                                                            )}
                                                            checked={
                                                                selectedNetworkDevices.filter(
                                                                    (item) =>
                                                                        item
                                                                            .device_ips[0] ===
                                                                            entry.ip &&
                                                                        item.discover_also
                                                                ).length > 0
                                                            }
                                                            onChange={(e) => {
                                                                handelNetworkDiscoveryChecked(
                                                                    e,
                                                                    entry.ip
                                                                );
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <button
                            className="btnStyle mt-15"
                            onClick={applyConfig}
                        >
                            Apply Config
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Home;
