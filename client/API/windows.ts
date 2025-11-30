import api from "./middleware";

export const getWindowsWeather = async (city: string) => {
  try {
    const { data } = await api.get(`/windows/weather?city=${city}`);
    if (data) {
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
    console.error("Error fetching windows weather: ", err);
    return {
      success: false,
      response: "Error fetching windows weather data",
    };
  }
};

export const getWindowsStatus = async () => {
  try {
    const { data } = await api.get(`/windows/status`);
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
    console.error("Error fetching windows status: ", err);
    return {
      success: false,
      response: "Error fetching windows status data",
    };
  }
};

export const controlWindow = async ({
  is_open,
  mode,
}: {
  is_open: boolean;
  mode: "auto" | "manual";
}) => {
  try {
    const { data } = await api.post(`windows/control`, {
      is_open,
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
        response: "Failed to control windows",
      };
    }
  } catch (err) {
    console.error("Error controlling windows: ", err);
    return {
      success: false,
      response: "Error controlling windows",
    };
  }
};

export const toggleWindowMode = async (mode: "auto" | "manual") => {
  try {
    const { data } = await api.post(`/windows/mode/${mode}`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to toggle window mode",
      };
    }
  } catch (err) {
    console.error("Error toggling windows mode: ", err);
    return {
      success: false,
      response: "Error toggling windows mode",
    };
  }
};

export const checkWindowsWeather = async () => {
  try {
    const { data } = await api.post(`/windows/check-weather`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to check windows weather",
      };
    }
  } catch (err) {
    console.error("Error checking windows weather: ", err);
    return {
      success: false,
      response: "Error checking windows weather",
    };
  }
};

export const getWindowsLogs = async () => {
  try {
    const { data } = await api.get(`/windows/logs`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No windows activity logs found",
      };
    }
  } catch (err) {
    console.error("Error fetching windows activity logs: ", err);
    return {
      success: false,
      response: "Error fetching windows activity logs",
    };
  }
};

export const clearWindowsLogs = async () => {
  try {
    const { data } = await api.delete(`/windows/logs/clear`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to clear windows activity logs",
      };
    }
  } catch (err) {
    console.error("Error clearing windows activity logs: ", err);
    return {
      success: false,
      response: "Error clearing windows activity logs",
    };
  }
};
