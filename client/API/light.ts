import api from "./middleware";

export const detectPresenceInLight = async (formData: FormData) => {
  try {
    const { data } = await api.post(`/lights/detect-presence`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No presence detected in room for light",
      };
    }
  } catch (err) {
    console.error("Error detecting presence in light: ", err);
    return {
      success: false,
      response: "Error detecting presence in room for light",
    };
  }
};

export const controlLight = async ({
  is_on,
  brightness,
  mode,
}: {
  is_on: boolean;
  brightness: number;
  mode: "auto" | "manual";
}) => {
  try {
    const { data } = await api.post(`/lights/control`, {
      is_on,
      brightness,
      mode,
    });
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to control light",
      };
    }
  } catch (err) {
    console.error("Error controlling light: ", err);
    return {
      success: false,
      response: "Error controlling light",
    };
  }
};

export const toggleLightMode = async (mode: "auto" | "manual") => {
  try {
    const { data } = await api.post(`/lights/mode/${mode}`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to toggle lights mode",
      };
    }
  } catch (err) {
    console.error("Error toggling lights mode: ", err);
    return {
      success: false,
      response: "Error toggling lights mode",
    };
  }
};

export const simulateRoomEmptyForLight = async () => {
  try {
    const { data } = await api.post(`/lights/simulate-empty`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to simulate room empty for light",
      };
    }
  } catch (err) {
    console.error("Error simulating room empty for light: ", err);
    return {
      success: false,
      response: "Error simulating room empty for light",
    };
  }
};

export const getLightStatus = async () => {
  try {
    const { data } = await api.get(`/lights/status`);
    if (data && data.id !== undefined) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No data found",
      };
    }
  } catch (err) {
    console.error("Error fetching light status: ", err);
    return {
      success: false,
      response: "Error fetching light status data",
    };
  }
};

export const getLightsTime = async () => {
  try {
    const { data } = await api.get(`/lights/time`);
    if (data && data.current_time) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No data found",
      };
    }
  } catch (err) {
    console.error("Error fetching lights time: ", err);
    return {
      success: false,
      response: "Error fetching lights time data",
    };
  }
};

export const getLightActivityLogs = async () => {
  try {
    const { data } = await api.get(`/lights/logs`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No fan activity logs found",
      };
    }
  } catch (err) {
    console.error("Error fetching fan activity logs: ", err);
    return {
      success: false,
      response: "Error fetching fan activity logs",
    };
  }
};

export const clearLightActivityLogs = async () => {
  try {
    const { data } = await api.delete(`/lights/logs/clear`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to clear fan activity logs",
      };
    }
  } catch (err) {
    console.error("Error clearing fan activity logs: ", err);
    return {
      success: false,
      response: "Error clearing fan activity logs",
    };
  }
};
