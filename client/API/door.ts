import api from "./middleware";

export const registerFaceForDoor = async (name: string, formData: FormData) => {
  try {
    const { data } = await api.post(
      `/door/register?person_name=${name}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to register face",
      };
    }
  } catch (err) {
    console.error("Error registering face for door:", err);
    return {
      success: false,
      response: "Failed to register face",
    };
  }
};

export const verifyFaceUnlock = async (formData: FormData) => {
  try {
    const { data } = await api.post("/door/verify", formData, {
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
        response: "Failed to verify face for door unlock",
      };
    }
  } catch (err) {
    console.error("Error verifying face for door unlock:", err);
    return {
      success: false,
      response: "Failed to verify face for door unlock",
    };
  }
};

export const manualDoorUnlock = async (reason: string = "Manual Unlock") => {
  try {
    const { data } = await api.post("/door/manual-unlock", { reason });
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to manually unlock door",
      };
    }
  } catch (err) {
    console.error("Error manually unlocking door:", err);
    return {
      success: false,
      response: "Failed to manually unlock door",
    };
  }
};

export const getDoorLogs = async () => {
  try {
    const { data } = await api.get("/door/logs");
    if (data && Array.isArray(data)) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No door logs found",
      };
    }
  } catch (err) {
    console.error("Error fetching door logs:", err);
    return {
      success: false,
      response: "Failed to fetch door logs",
    };
  }
};

export const clearDoorLogs = async () => {
  try {
    const { data } = await api.delete("/door/logs/clear");
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to clear door logs",
      };
    }
  } catch (err) {
    console.error("Error clearing door logs:", err);
    return {
      success: false,
      response: "Failed to clear door logs",
    };
  }
};

export const getRegisteredFaces = async () => {
  try {
    const { data } = await api.get("/door/registered-faces");
    if (data && Array.isArray(data)) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "No registered faces found",
      };
    }
  } catch (err) {
    console.error("Error fetching registered faces:", err);
    return {
      success: false,
      response: "Failed to fetch registered faces",
    };
  }
};

export const deleteRegisteredFace = async (id: number) => {
  try {
    const { data } = await api.delete(`/door/registered-faces/${id}`);
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to delete registered face",
      };
    }
  } catch (err) {
    console.error("Error deleting registered face:", err);
    return {
      success: false,
      response: "Failed to delete registered face",
    };
  }
};

export const getDoorStatus = async () => {
  try {
    const { data } = await api.get("/door/status");
    if (data) {
      return {
        success: true,
        response: data,
      };
    } else {
      return {
        success: false,
        response: "Failed to fetch door status",
      };
    }
  } catch (err) {
    console.error("Error fetching door status:", err);
    return {
      success: false,
      response: "Failed to fetch door status",
    };
  }
};
