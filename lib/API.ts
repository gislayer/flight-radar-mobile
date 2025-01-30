import axios, { AxiosResponse } from 'axios';

interface GLConstructor {
  newurl?: string;
}

interface GLResponse {
  data: any;
}

class API {
  private token = '';
  private user = '';
  private tenant_id = 1;
  private url = `/api`;

  constructor({ newurl }: GLConstructor) {
    this.url = newurl ?? this.url;
  }

  

  private getHeader() {
    return {
      Authorization: `Bearer ${this.token}`,
      'X-Tenant-ID': this.tenant_id,
    };
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const header = this.getHeader();
      const response: AxiosResponse<GLResponse> = await axios.delete(`${this.url}/${endpoint}`, { headers: header });
      return response.data.data;
    } catch (err: any) {
      this.errHandler(err);
      return false;
    }
  }

  async patch(endpoint: string, data: any): Promise<any> {
    try {
      const header = this.getHeader();
      const response: AxiosResponse<GLResponse> = await axios.patch(`${this.url}/${endpoint}`, data, { headers: header });
      return response.data.data;
    } catch (err: any) {
      this.errHandler(err, data);
      return false;
    }
  }

  async upload(file: File): Promise<any> {
    try {
      const header:any = this.getHeader();
      header['Content-Type'] = 'multipart/form-data';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      const response: AxiosResponse<GLResponse> = await axios.post(`${this.url}/files`, formData, { headers: header });
      return response.data.data;
    } catch (err: any) {
      this.errHandler(err);
      return false;
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    try {
      const header = this.getHeader();
      const response: AxiosResponse<GLResponse> = await axios.post(`${this.url}/${endpoint}`, data, { headers: header });
      return response.data.data;
    } catch (err: any) {
      this.errHandler(err, data);
      return false;
    }
  }

  async get(endpoint: string): Promise<any> {
    try {
      const header = this.getHeader();
      const response: AxiosResponse<GLResponse> = await axios.get(`${this.url}/${endpoint}`, { headers: header });
      return response.data.data;
    } catch (err: any) {
      this.errHandler(err);
      return false;
    }
  }

  async getFile(endpoint: string): Promise<any> {
    try {
      const header = this.getHeader();
      const response: AxiosResponse<GLResponse> = await axios.get(`${this.url}/${endpoint}`, { headers: header });
      return response.data;
    } catch (err: any) {
      this.errHandler(err);
      return false;
    }
  }

  private errHandler(err: any, data?:any) {
    debugger;
    if (err.response.status === 401) {
      var messages = ['Unauthorized','Invalid token'];
      if(messages.includes(err.response.data.message)){
        console.log('Unauthorized');
      }
      if(err.response.data.message ==='User account is not activated'){
        console.log('User account is not activated');
      }
    }else if(err.response.status === 500){
      if (err.response.data.message === 'jwt expired') {
        console.log('Token expired');
      }
    }
    alert(err.response.data.message);
    return false;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }
}

export default API;
