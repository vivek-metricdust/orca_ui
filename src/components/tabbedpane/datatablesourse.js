import { Link } from "react-router-dom";
import React from "react";
import EditableHeaderComponent from "./EditableHeaderComponent";
import { getIsStaff } from "../../utils/common";

export const defaultColDef = {
  tooltipValueGetter: (params) => {
    return params?.value;
  },
  resizable: true,
  singleClickEdit: "true",
};

export const getCellEditorParamsDeviceImageList = (params) => {
  if (params?.data?.image_list?.length > 0) {
    return {
      values: params?.data?.image_list,
    };
  } else {
    return {
      values: [params?.data?.img_name],
    };
  }
};

export const deviceUserColumns = (showIn) => {
  let dataColumn = [
    {
      field: "mgt_ip",
      headerName: "Management IP",
      width: 130,
      sortable: true,
    },
    {
      field: "img_name",
      headerName: "Image Name",
      width: 130,
      sortable: true,
      editable: getIsStaff() && showIn === "home",
      showIcon: getIsStaff(),

      headerComponent: EditableHeaderComponent,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: getCellEditorParamsDeviceImageList,
      cellRenderer: (params) => {
        return <span>{params.value}</span>;
      },
    },
    {
      field: "mgt_intf",
      headerName: "Management Int",
      width: 130,
      sortable: true,
    },
    {
      field: "hwsku",
      headerName: "HWSKU",
      type: "number",
      width: 130,
      sortable: true,
    },
    {
      field: "mac",
      headerName: "MAC",
      width: 130,
      sortable: true,
    },
    {
      field: "platform",
      headerName: "PLATFORM",
      width: 130,
      sortable: true,
    },
    {
      field: "system_status",
      headerName: "Sonic Status",
      width: 130,
      sortable: true,
    },

    { field: "type", headerName: "TYPE", width: 130, sortable: true },
  ];

  if (showIn === "home" || showIn === "all") {
    dataColumn.push({
      field: "action",
      headerName: "Action",
      width: 200,
      cellRenderer: (params) => {
        return (
          <>
            <Link to={`/devices/${params?.data?.mgt_ip}`}>
              <button id="ipDetailsBtn" className="btnStyle">
                Details
              </button>
            </Link>
            <button
              id="ipRemoveBtn"
              disabled={!getIsStaff()}
              className="ml-10 btnStyle"
            >
              Remove
            </button>
          </>
        );
      },
    });
  }

  if (showIn === "info" || showIn === "all") {
    dataColumn.unshift({
      field: "sync_in",
      headerName: "Rediscovery Frequency",
      width: 200,
      editable: getIsStaff(),
    });
  }
  if (showIn === "info" || showIn === "all") {
    dataColumn.push({
      field: "orca_status",
      headerName: "Device Status in Orca",
      width: 130,
      sortable: true,
    });
  }
  if (showIn === "setup" || showIn === "all") {
    dataColumn.unshift({
      headerCheckboxSelection: getIsStaff() && showIn === "setup",
      checkboxSelection: getIsStaff() && showIn === "setup",
      width: 50,
      sortable: true,
      headerTooltip: "", // add header tooltip here
    });
  }
  return dataColumn;
};

export const getCellEditorParamsInterfaceSpeed = (params) => {
  let result = [];

  if (params?.data?.valid_speeds === null) {
    result.push(params.data.speed);
  } else {
    let valid_speeds = params?.data?.valid_speeds?.split(",");
    valid_speeds?.forEach((element) => {
      const bytesInGB = 1000;
      let converted_value = element / bytesInGB;
      converted_value = "SPEED_" + converted_value + "GB";
      result?.push(converted_value);
    });
  }

  return {
    values: result,
  };
};

export const getCellEditorParamsInterfaceAdvSpeed = (params) => {
  let valid_speeds = params?.data?.valid_speeds?.split(",");
  let result = ["all"];
  valid_speeds?.forEach((element) => {
    const bytesInGB = 1000;
    let converted_value = element / bytesInGB;
    converted_value = "SPEED_" + converted_value + "GB";
    result?.push(converted_value);
  });

  return {
    values: result,
  };
};

export const getCellEditorParamsInterfaceBreakout = (params, originalData) => {
  let temp = originalData.find((item) => item.name === params.data.name);

  let result = [];
  let regex = /^Eth[0-9/]+\/1$/;
  if (
    params.data.breakout_supported &&
    params.data.alias.match(/\//g).length === 1
  ) {
    result = [
      "Not Configured",
      "1xSPEED_400GB",
      "1xSPEED_200GB",
      "2xSPEED_200GB",
      "1xSPEED_200GB",
      "4xSPEED_100GB",
      "2xSPEED_100GB",
      "1xSPEED_100GB",
      "8xSPEED_50GB",
      "4xSPEED_50GB",
      "2xSPEED_50GB",
      "1xSPEED_50GB",
      "2xSPEED_40GB",
      "1xSPEED_40GB",
      "8xSPEED_25GB",
      "4xSPEED_25GB",
      "2xSPEED_25GB",
      "1xSPEED_25GB",
      "8xSPEED_10GB",
      "4xSPEED_10GB",
      "2xSPEED_10GB",
      "1xSPEED_10GB",
    ];
  } else if (
    (!params.data.breakout_supported || params.data.breakout_supported) &&
    regex.test(params?.data?.alias)
    // params.data.alias.includes("/1") &&
    // params.data.alias.match(/\//g).length === 2
  ) {
    result = ["Not Configured", temp.breakout_mode || "None"];
  } else {
    result = ["Not supported"];
  }

  return {
    values: result,
  };
};

export const getBreakout = (params) => {
  let regex = /^Eth[0-9/]+\/1$/;

  if (
    params.data.breakout_supported &&
    params.data.alias.match(/\//g).length === 1
  ) {
    return true;
  } else if (
    (!params.data.breakout_supported || params.data.breakout_supported) &&
    regex.test(params?.data?.alias)
  ) {
    return true;
  } else {
    return false;
  }
};

export const interfaceColumns = (originalData) => [
  {
    field: "name",
    headerName: "Name",
    width: 130,
    getQuickFilterText: (params) => {
      if (params?.data?.name?.includes("Ethernet")) {
        return params?.data?.name;
      }
    },
    sortable: true,
    headerTooltip: "Test tool tip", // add header tooltip here
  },
  {
    field: "enabled",
    headerName: "Enabled",
    width: 130,
    cellRenderer: "agCheckboxCellRenderer",
    cellEditor: "agCheckboxCellEditor",
    editable: getIsStaff(),
    suppressKeyboardEvent: (params) => params?.event?.key === " ",
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "test tool tip", // add header tooltip here
  },
  {
    field: "mtu",
    headerName: "MTU",
    type: "number",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "fec",
    headerName: "FEC",
    width: 130,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    singleClickEdit: true,
    cellEditorParams: {
      values: ["FEC_RS", "FEC_FC", "FEC_DISABLED", "FEC_AUTO"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  { field: "oper_sts", headerName: "Oper STS", width: 130, sortable: true },
  {
    field: "speed",
    headerName: "Speed",
    width: 130,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    cellEditorParams: getCellEditorParamsInterfaceSpeed,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  // breakout_supported: true
  {
    field: "breakout_mode",
    headerName: "Breakout",
    width: 130,
    editable: getIsStaff() && getBreakout,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: (params) => {
      return getCellEditorParamsInterfaceBreakout(params, originalData);
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    cellRenderer: (params) => {
      if (params.data.breakout_supported) {
        return params.value || "Not Configured";
      } else if (
        !params.data.breakout_supported &&
        params?.data?.alias.match(/\//g)?.length === 2
      ) {
        return params.value || "None";
      } else {
        return "Not supported";
      }
    },
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "breakout_status",
    headerName: "Breakout Status",
    width: 130,
    cellRenderer: (params) => {
      if (
        params.data.breakout_supported ||
        params.data.alias.match(/\//g).length === 2
      ) {
        return params.value || "Unknown";
      } else {
        return "Not supported";
      }
    },
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "admin_sts",
    headerName: "Admin Status",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "description",
    headerName: "Description",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "ip_address",
    headerName: "IP Address",
    width: 130,
    sortable: true,
    editable: false,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
    cellRenderer: (params) => {
      let primary = "None";
      let secondary = [];

      params?.value?.forEach((element) => {
        if (element?.secondary) {
          secondary.push(element?.ip_address + "/" + element.prefix);
        } else {
          primary = element?.ip_address + "/" + element.prefix;
        }
      });

      let secondaryString =
        secondary.length > 0 ? secondary.join(", ") : "None";

      if (primary !== "None" || secondary.length > 0) {
        return "Primary - " + primary + " Secondary - " + secondaryString;
      } else {
        return "None";
      }
    },
    tooltipValueGetter: (params) => {
      let primary = "None";
      let secondary = [];

      params?.value?.forEach((element) => {
        if (element?.secondary) {
          secondary.push(element?.ip_address + "/" + element.prefix);
        } else {
          primary = element?.ip_address + "/" + element.prefix;
        }
      });

      let secondaryString =
        secondary.length > 0 ? secondary.join(", ") : "None";

      if (primary !== "None" || secondary.length > 0) {
        return "Primary - " + primary + " Secondary - " + secondaryString;
      } else {
        return "None";
      }
    },
  },
  {
    field: "last_chng",
    headerName: "Last Change",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mac_addr",
    headerName: "MAC ADDR",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "alias",
    headerName: "Alias",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "lanes",
    headerName: "Lanes",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "autoneg",
    headerName: "Autoneg",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    singleClickEdit: true,
    cellEditorParams: {
      values: ["off", "on"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "adv_speeds",
    headerName: "Adv Speeds",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    cellEditorParams: getCellEditorParamsInterfaceAdvSpeed,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "link_training",
    headerName: "Link Training",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    singleClickEdit: true,
    cellEditorParams: {
      values: ["off", "on"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
];

export const portChannelColumns = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "lag_name",
    headerName: "Channel Name",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "active",
    headerName: "Active",
    cellDataType: "boolean",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "admin_sts",
    headerName: "Admin Status",
    width: 150,
    editable: (params) => {
      const regex = /Management*/i;
      if (regex?.test(params?.data?.name) || !getIsStaff()) {
        return false;
      } else {
        return true;
      }
    },
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["up", "down"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mtu",
    headerName: "MTU",
    type: "number",
    width: 130,
    editable: (params) => {
      const regex = /Management*/i;
      if (regex?.test(params?.data?.name) || !getIsStaff()) {
        return false;
      } else {
        return true;
      }
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "name",
    headerName: "Name",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "description",
    headerName: "Description",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "ip_address",
    headerName: "IP Address",
    width: 130,
    sortable: true,
    editable: false,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "fallback_operational",
    headerName: "Fallback Operation",
    cellDataType: "boolean",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "oper_sts",
    headerName: "Operation Status",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "speed",
    headerName: "Speed",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "min_links",
    headerName: "Min Links",
    width: 130,
    sortable: true,
    cellDataType: "number",
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "graceful_shutdown_mode",
    headerName: "Graceful Shutdown Mode",
    width: 130,
    sortable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["enable", "disable"],
    },
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "static",
    headerName: "Static",
    width: 130,
    sortable: true,
    cellDataType: "boolean",
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "fallback",
    headerName: "Fallback",
    width: 130,
    sortable: true,
    cellDataType: "boolean",
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "fast_rate",
    headerName: "Fast Rate",
    width: 130,
    sortable: true,
    cellDataType: "boolean",
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "oper_sts_reason",
    headerName: "OperReason",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "members",
    headerName: "Members",
    width: 130,
    editable: false,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
    cellRenderer: (params) => {
      return JSON.parse(params.value).join(", ");
    },
  },
  {
    field: "vlan_members",
    headerName: "Access Vlan",
    width: 130,
    editable: false,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    cellRenderer: (params) => {
      let js = JSON.parse(params.value);

      if (js?.vlan_ids?.length > 0) {
        return (
          js.if_mode + " - " + js?.vlan_ids?.map((id) => "Vlan" + id).join(", ")
        );
      } else {
        return "";
      }
    },
    tooltipValueGetter: (p) => {
      let js = JSON.parse(p.value);
      return (
        js.if_mode + " - " + js?.vlan_ids?.map((id) => "Vlan" + id).join(", ")
      );
    },
    headerTooltip: "", // add header tooltip here
  },
];

export const mclagColumns = (interfaceNames) => [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
  },
  {
    field: "domain_id",
    headerName: "Domain_ID",
    cellDataType: "number",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "keepalive_interval",
    headerName: "Keepalive Interval",
    cellDataType: "number",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mclag_sys_mac",
    headerName: "MCLAG Sys MAC",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "peer_addr",
    headerName: "Peer Address",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "peer_link",
    headerName: "Peer Link",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: interfaceNames,
    },
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "session_timeout",
    headerName: "Session Timeout",
    cellDataType: "number",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "source_address",
    headerName: "Source Address",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "oper_status",
    headerName: "Operation Status",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "role",
    headerName: "Role",
    width: 130,
    // editable: getIsStaff(),
    showIcon: getIsStaff(),
    //
    headerComponent: EditableHeaderComponent,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "gateway_mac",
    headerName: "Gateway MAC",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "delay_restore",
    headerName: "Delay Restore",
    cellDataType: "number",
    width: 130,
    editable: getIsStaff(),
    sortable: true,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "fast_convergence",
    headerName: "Fast Convergence",
    width: 130,
    editable: getIsStaff(),
    sortable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["enable", "disable"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "session_vrf",
    headerName: "session vrf",
    width: 130,
    editable: getIsStaff(),
    sortable: true,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mclag_members",
    headerName: "Members",
    width: 130,
    sortable: true,
    editable: false,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
];

export const portGroupColumns = [
  {
    field: "port_group_id",
    headerName: "ID",
    width: 75,
    sortable: true,
    comparator: (valueA, valueB) => valueA - valueB,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "speed",
    headerName: "Speed",
    width: 130,
    editable: (params) => {
      const regex = /Management*/i;
      if (regex?.test(params?.data?.name) || !getIsStaff()) {
        return false;
      } else {
        return true;
      }
    },
    cellEditor: "agSelectCellEditor",
    cellEditorParams: (params) => {
      return {
        values: params?.data?.valid_speeds,
      };
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "valid_speeds",
    headerName: "Valid Speeds",
    cellDataType: "text",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "default_speed",
    headerName: "Default Speed",
    cellDataType: "text",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mem_intfs",
    headerName: "Member IFs",
    cellDataType: "text",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
];

export const bgpColumns = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
  },
  {
    field: "local_asn",
    headerName: "ASN",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "vrf_name",
    headerName: "VRF",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "router_id",
    headerName: "Router ID",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  // {
  //   field: "neighbor_prop",
  //   headerName: "Neighbors",
  //   width: 130,
  //   sortable: true,
  //   headerTooltip: "", // add header tooltip here
  // },
];
export const valnIp = (params) => {
  if (params.data.sag_ip_address) {
    return false;
  } else {
    return true;
  }
};

export const valnSagIp = (params) => {
  if (params?.data?.ip_address) {
    return false;
  } else {
    return true;
  }
};

export const vlanColumns = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "vlanid",
    headerName: "Vlan ID",
    type: "number",
    width: 90,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "name",
    headerName: "Name",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "description",
    headerName: "Description",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "autostate",
    headerName: "Autostate",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["enable", "disable"],
    },
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "ip_address",
    headerName: "IP Address",
    width: 130,
    sortable: true,
    editable: getIsStaff() && valnIp,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "sag_ip_address",
    headerName: "Anycast Address",
    width: 130,
    sortable: true,
    editable: false,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mtu",
    headerName: "MTU",
    type: "number",
    width: 130,
    editable: getIsStaff(),
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "enabled",
    headerName: "Admin Status",
    type: "boolean",
    width: 150,
    editable: getIsStaff(),
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["up", "down"],
    },
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "oper_status",
    headerName: "Oper_STS",
    type: "boolean",
    width: 130,
    sortable: true,
    headerTooltip: "", // add header tooltip here
  },
  {
    field: "mem_ifs",
    headerName: "Member IFs",
    width: 130,
    editable: false,
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
    headerTooltip: "", // add header tooltip here
    cellRenderer: (params) => {
      let js;

      try {
        js = JSON.parse(params.value);
      } catch (e) {
        return null;
      }

      if (!js || Object.keys(js).length === 0) {
        return null;
      }

      const grouped = {};

      for (const [key, value] of Object.entries(js)) {
        if (!grouped[value]) {
          grouped[value] = [];
        }
        grouped[value].push(key);
      }

      return (
        "ACCESS - " +
        (grouped?.["ACCESS"]?.join(", ") || "Null") +
        "\n TRUNK - " +
        (grouped?.["TRUNK"]?.join(", ") || "Null")
      );
    },

    tooltipValueGetter: (params) => {
      let js;

      try {
        js = JSON.parse(params.value);
      } catch (e) {
        return null;
      }

      if (!js || Object.keys(js).length === 0) {
        return null;
      }

      const grouped = {};

      for (const [key, value] of Object.entries(js)) {
        if (!grouped[value]) {
          grouped[value] = [];
        }
        grouped[value].push(key);
      }

      return (
        "ACCESS - " +
        (grouped?.["ACCESS"]?.join(", ") || "Null") +
        "\n TRUNK - " +
        (grouped?.["TRUNK"]?.join(", ") || "Null")
      );
    },
  },
];

export const stpColumn = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
  },
  {
    field: "enabled_protocol",
    headerName: "Enabled Protocol",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["PVST", "MSTP", "RSTP", "RAPID_PVST"],
    },
  },
  {
    field: "bpdu_filter",
    headerName: "BPDU Filter",
    width: 130,
    sortable: true,
    cellDataType: "boolean",
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "forwarding_delay",
    headerName: "Forwarding Delay",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "hello_time",
    headerName: "Hello Time",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "max_age",
    headerName: "Max Age",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "bridge_priority",
    headerName: "Bridge Priority",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "rootguard_timeout",
    headerName: "Rootguard Timeout",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),
    headerComponent: EditableHeaderComponent,
  },
  {
    field: "loop_guard",
    headerName: "Loop Guard",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "portfast",
    headerName: "Portfast",
    width: 130,
    sortable: true,
    editable: getIsStaff(),
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
  {
    field: "disabled_vlans",
    headerName: "Disabled Vlans",
    width: 130,
    sortable: true,
    editable: false,
    showIcon: getIsStaff(),

    headerComponent: EditableHeaderComponent,
  },
];

export const dhcpColumn = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
  },
  {
    field: "mgt_ip",
    headerName: "Management IP",
    width: 130,
    sortable: true,
  },
  {
    field: "img_name",
    headerName: "Image Name",
    width: 130,
    sortable: true,
  },
  {
    field: "mgt_intf",
    headerName: "Management Int",
    width: 130,
    sortable: true,
  },
  {
    field: "hwsku",
    headerName: "HWSKU",
    type: "number",
    width: 130,
    sortable: true,
  },
  {
    field: "mac",
    headerName: "MAC",
    width: 130,
    sortable: true,
  },
  {
    field: "platform",
    headerName: "PLATFORM",
    width: 130,
    sortable: true,
  },
  { field: "type", headerName: "TYPE", width: 130, sortable: true },
];

export const ipRangeColumn = [
  {
    headerCheckboxSelection: getIsStaff(),
    checkboxSelection: getIsStaff(),
    width: 50,
  },
  {
    field: "range",
    headerName: "Range",
    width: 300,
    sortable: true,
  },
];

export const ipPoolColumn = [
  {
    field: "ip",
    headerName: "IP",
    width: 200,
    sortable: true,
  },
  {
    field: "used_in",
    headerName: "Used In",
    width: 200,
    sortable: true,
  },
  {
    field: "device_ip",
    headerName: "Device IP",
    width: 200,
    sortable: true,
  },
];
