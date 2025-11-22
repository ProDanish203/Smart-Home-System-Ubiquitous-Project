import api from "./middleware";

export const getFanWeather = async (city: string) => {
  try {
    const { data } = await api.get(`/fan/weather?city=${city}`);
    if (data && data.temperature !== undefined) {
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
    console.error("Error fetching fan weather: ", err);
    return {
      success: false,
      response: "Error fetching fan weather data",
    };
  }
};

export const getFanStatus = async () => {
  try {
    const { data } = await api.get(`/fan/status`);
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
    console.error("Error fetching fan status: ", err);
    return {
      success: false,
      response: "Error fetching fan status data",
    };
  }
};

export const controlFan = async ({
  speedLeveL,
  mode,
}: {
  speedLeveL: string;
  mode: string;
}) => {
  try {
    const { data } = await api.post(`fan/control`, {
      speed_level: speedLeveL,
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
        response: "Failed to control fan",
      };
    }
  } catch (err) {
    console.error("Error controlling fan: ", err);
    return {
      success: false,
      response: "Error controlling fan",
    };
  }
};

export const toggleFanMode = async (mode: "auto" | "manual") => {
  try {
    const { data } = await api.post(`/fan/mode/${mode}`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to toggle fan mode",
      };
    }
  } catch (err) {
    console.error("Error toggling fan mode: ", err);
    return {
      success: false,
      response: "Error toggling fan mode",
    };
  }
};

export const adjustFanTemperature = async (temperature: number) => {
  try {
    const { data } = await api.post(`/fan/temperature/adjust`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        sucess: false,
        response: "Failed to adjust fan temperature",
      };
    }
  } catch (err) {
    console.error("Error adjusting fan temperature: ", err);
    return {
      success: false,
      response: "Error adjusting fan temperature",
    };
  }
};

export const getFanActivityLogs = async () => {
  try {
    const { data } = await api.get(`/fan/activity`);
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

export const clearFanActivityLogs = async () => {
  try {
    const { data } = await api.delete(`/fan/activity/clear`);
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
