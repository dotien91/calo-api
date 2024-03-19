import axios, { AxiosResponse } from "axios";

export class HttpClientService {
  private headers = {
    "App-Name": process.env.APP_NAME,
  };

  async get$(url: string, params: any): Promise<AxiosResponse> {
    return await axios
      .get(url, {
        params,
        headers: this.headers,
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async post$(url: string, body?: any, headers?: any): Promise<AxiosResponse> {
    return await axios
      .post(url, body, {
        headers: {
          ...this.headers,
          ...headers,
        },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async put$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .put(url, body, {
        headers: this.headers,
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async patch$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .patch(url, body, {
        headers: {
          ...this.headers,
        },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async delete$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .delete(url, {
        data: body,
        headers: this.headers,
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async postBinary$(url: string, data: ArrayBuffer): Promise<AxiosResponse> {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url,
      headers: {
        "Content-Type": "audio/mpeg",
      },
      data: data,
    };

    return await axios
      .request(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error;
      });
  }
}
