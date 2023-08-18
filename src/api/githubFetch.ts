import createRequest from "../utils/request";

// https://github.com/HoseaGuo/articles/issues

const OWNER = 'HoseaGuo';
const REPO = "articles";

const request = createRequest({
  baseURL: `https://api.github.com/repos/${OWNER}/${REPO}`
});

export default {
  // 获取一个issue
  getIssues() {
    return request({
      url: "/issues",
      method: 'get'
    });
  }
};
