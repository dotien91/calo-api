import axios, { AxiosResponse } from "axios";

export class HttpClientService {
  async get$(url: string, params: any): Promise<AxiosResponse> {
    return await axios
      .get(url, params)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  }

  async post$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .post(url, body)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  }

  async put$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .put(url, body)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  }

  async patch$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .patch(url, body)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  }

  async delete$(url: string, body: any): Promise<AxiosResponse> {
    return await axios
      .delete(url, body)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
  }
}
