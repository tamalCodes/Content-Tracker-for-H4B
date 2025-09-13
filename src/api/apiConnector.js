import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = async (method, url, bodyData, headers, params) => {
  try {
    return await axiosInstance({
      method,
      url,
      data: bodyData ? bodyData : null,
      headers: headers ? headers : null,
      params: params ? params : null,
      crossOrigin: true,
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return {
      status: "unknown",
      message: "An unknown error occurred",
    };
  }
};
