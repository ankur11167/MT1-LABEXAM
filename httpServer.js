
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory shopping cart array
const cart = [];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // ─── GET / ───────────────────────────────────────────────────────────────
  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
        <body>
          <h1>Welcome to the Shopping Cart Management App</h1>
          <p>Use the available routes to manage your cart.</p>
        </body>
      </html>
    `);

    // ─── GET /cart ────────────────────────────────────────────────────────────
  } else if (method === "GET" && url === "/cart") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          success: true,
          totalItems: cart.length,
          cart: cart,
        },
        null,
        2,
      ),
    );

    // ─── GET /about ───────────────────────────────────────────────────────────
  } else if (method === "GET" && url === "/about") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        {
          appName: "Shopping Cart Management App",
          version: "1.0.0",
          description:
            "A Node.js-based shopping cart application built with the built-in http module.",
          author: "MT1-LABEXAM",
          routes: [
            "GET /",
            "GET /cart",
            "GET /about",
            "GET /home",
            "POST /add-to-cart",
          ],
        },
        null,
        2,
      ),
    );

    // ─── GET /home ────────────────────────────────────────────────────────────
  } else if (method === "GET" && url === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to read index.html",
            details: err.message,
          }),
        );
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });

    // ─── POST /add-to-cart ────────────────────────────────────────────────────
  } else if (method === "POST" && url === "/add-to-cart") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Invalid JSON body." }),
        );
        return;
      }

      const { id, productName, price, quantity } = parsed;

      // Validation
      if (
        !id ||
        !productName ||
        price === undefined ||
        quantity === undefined
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Missing required fields: id, productName, price, quantity.",
          }),
        );
        return;
      }

      if (typeof price !== "number" || price <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "price must be a positive number.",
          }),
        );
        return;
      }

      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "quantity must be a positive integer.",
          }),
        );
        return;
      }

      const item = { id, productName, price, quantity };
      cart.push(item);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            success: true,
            message: `'${productName}' added to cart successfully.`,
            item,
            totalItems: cart.length,
          },
          null,
          2,
        ),
      );
    });

    // ─── 404 Not Found ────────────────────────────────────────────────────────
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: `Route '${method} ${url}' not found.`,
      }),
    );
  }
});

server.listen(PORT, () => {
  console.log(`🚀 HTTP Server running at http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("  GET  /");
  console.log("  GET  /cart");
  console.log("  GET  /about");
  console.log("  GET  /home");
  console.log("  POST /add-to-cart");
});
