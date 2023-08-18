import axios, { AxiosRequestConfig } from "axios";

interface Config extends AxiosRequestConfig {
  showErrorMsg?: boolean;
}

/* 请求方法 */
export default function createRequest(config?: Config) {

  const instance = axios.create({
    timeout: 60 * 1000 * 2,
    ...config
  });

  // instance.interceptors.request.use(function (config) {
  //   console.log(config);
  //   return config;
  // });

  return function (config: Config) {

    const result: {
      success: boolean,
      data: any,
      msg: string,
      response: any;
    } = {
      success: false,
      data: null,
      msg: "",
      response: null
    };

    return new Promise<{ success: boolean, data: any, msg: string; }>((resolve) => {
      instance.request(config).then((res) => {
        const { data } = res;
        result.response = data;
        result.msg = data.msg || data.message;

        let showErrorMsg = config.hasOwnProperty("showErrorMsg") ? config.showErrorMsg : true;

        if (res.status === 200) {
          result.success = true;
          result.data = res.data;
        } else {
          if (showErrorMsg) alert(result.msg);
        }

        resolve(result);
      }).catch((err) => {
        result.msg = `請求出錯，code: ${err.response.status}`;
        console.log(result.msg);
        resolve(result);
      });
    });
  };

}