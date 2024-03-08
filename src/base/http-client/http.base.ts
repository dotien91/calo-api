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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
        return error;
      });
  }
}
