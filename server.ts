import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import os from 'os';

// const {
//   createStaticHandler,
// } = require("react-router-dom/server");


// 获取ip地址的：
const ifaces = os.networkInterfaces();
const ipAddress: string[] = [];
Object.entries(ifaces).forEach(([key, value]) => {
  value?.forEach(details => {
    if (details.family === 'IPv4') {
      ipAddress.push(details.address);
    }
  });
});

const isProd = process.env.NODE_ENV === 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  let vite: ViteDevServer;

  console.log('It\'s production', isProd);

  if (!isProd) {
    // 以中间件模式创建 Vite 应用，并将 appType 配置为 'custom'
    // 这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    // 使用 vite 的 Connect 实例作为中间件
    // 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
    app.use(vite.middlewares);

  } else {
    const resolve = (p: any) => path.resolve(__dirname, p);
    app.use(
      (await import('serve-static')).default(resolve('dist/client'), {
        index: false,
      }),
    );
  }

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. 读取 index.html，生产环境和开发环境不同的
      let indexHtmlPath = !isProd ? './index.html' : './dist/client/index.html';
      let template = fs.readFileSync(
        path.resolve(__dirname, indexHtmlPath),
        'utf-8',
      );
      
      let render;
      if (!isProd) {
        // 2. 应用 Vite HTML 转换。这将会注入 Vite HMR 客户端，
        //    同时也会从 Vite 插件应用 HTML 转换。
        //    例如：@vitejs/plugin-react 中的 global preambles
        // 转换html，在html中添加了一些 script 代码
        template = await vite.transformIndexHtml(url, template);

        // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
        //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
        //    并提供类似 HMR 的根据情况随时失效。
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // @ts-ignore
        render = (await import('./dist/server/entry-server.js')).render;
      }

      // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`   后端根据App页面生成的html结构，用来替换到index.html里面
      //    函数调用了适当的 SSR 框架 API。
      //    例如 ReactDOMServer.renderToString()
      //    如果是已经打包的，就是类似jsx语法糖函数的参数结构
      const appHtml = await render(url);

      // 5. 注入渲染后的应用程序 HTML 到模板中。
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 6. 返回渲染后的 HTML。
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      // 如果捕获到了一个错误，让 Vite 来修复该堆栈，这样它就可以映射回
      // 你的实际源码中。
      vite?.ssrFixStacktrace(e);
      next(e);
    }
  });

  let port = isProd ? 9898 : 5173;

  console.log(`App running at:`);
  ipAddress.forEach(ip => {
    let type = ip.includes('127.0.0.1') ? 'Local' : 'Network';
    console.log(`- ${type}:   http://${ip}:${port}`);
  });
  app.listen(port);
}

createServer();