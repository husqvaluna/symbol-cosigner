import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("waiting", "routes/waiting.tsx"),
  route("pending", "routes/pending.tsx"),
  route("addresses", "routes/addresses.tsx"),
  route("addresses/:address", "routes/addresses.address.tsx"),
  route("nodes", "routes/nodes.tsx"),
  route("nodes/:id", "routes/nodes.$id.tsx"),
] satisfies RouteConfig;
