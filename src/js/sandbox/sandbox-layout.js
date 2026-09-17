import { REAL_ICS } from './real-ic-defs.js';

export const GRID_SIZE = 10;

export function snapWorld(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function getNodePlacementPoint(type, worldX, worldY) {
  const isIC = Boolean(REAL_ICS[type]);
  const halfWidth = isIC ? 195 : 60;
  const halfHeight = isIC ? 95 : 40;
  return { x: snapWorld(worldX - halfWidth), y: snapWorld(worldY - halfHeight) };
}

export function findFreePlacement(type, worldX, worldY, { nodes, screenToWorld, workspaceRect }) {
  const base = getNodePlacementPoint(type, worldX, worldY);
  const candidates = [
    { x: 0, y: 0 }, { x: 220, y: 0 }, { x: -220, y: 0 },
    { x: 0, y: 150 }, { x: 0, y: -150 }, { x: 220, y: 150 }, { x: -220, y: 150 },
  ];
  const isIC = Boolean(REAL_ICS[type]);
  const width = isIC ? 400 : 130;
  const height = isIC ? 290 : 100;
  const overlaps = (x, y) => nodes.some(node => {
    const otherIsIC = Boolean(REAL_ICS[node.type]);
    const otherWidth = otherIsIC ? 400 : 130;
    const otherHeight = otherIsIC ? 290 : 100;
    return x < node.x + otherWidth && x + width > node.x && y < node.y + otherHeight && y + height > node.y;
  });
  const topLeft = screenToWorld(workspaceRect.left, workspaceRect.top);
  const bottomRight = screenToWorld(workspaceRect.right, workspaceRect.bottom);
  const visible = {
    left: Math.min(topLeft.x, bottomRight.x), top: Math.min(topLeft.y, bottomRight.y),
    right: Math.max(topLeft.x, bottomRight.x), bottom: Math.max(topLeft.y, bottomRight.y),
  };
  for (const offset of candidates) {
    const x = snapWorld(base.x + offset.x);
    const y = snapWorld(base.y + offset.y);
    if (!overlaps(x, y) && x >= visible.left + 12 && y >= visible.top + 88 && x + width <= visible.right - 12 && y + height <= visible.bottom - 12) {
      return { x, y };
    }
  }
  return { x: snapWorld(base.x), y: snapWorld(Math.max(base.y, visible.top + 88)) };
}

export function organizeCircuit({ nodes, wires, getElement, workspaceRect, setViewport, applyViewportTransform, updateWires }) {
  const incoming = new Map(nodes.map(node => [node.id, []]));
  wires.forEach(wire => incoming.get(wire.toNodeId)?.push(wire.fromNodeId));
  const depths = new Map();
  const depthOf = (nodeId, visiting = new Set()) => {
    if (depths.has(nodeId)) return depths.get(nodeId);
    if (visiting.has(nodeId)) return 0;
    visiting.add(nodeId);
    const depth = Math.max(0, ...(incoming.get(nodeId) || []).map(parent => depthOf(parent, new Set(visiting)) + 1));
    depths.set(nodeId, depth);
    return depth;
  };
  nodes.forEach(node => depthOf(node.id));

  const columns = new Map();
  nodes.forEach(node => {
    const depth = depths.get(node.id) || 0;
    if (!columns.has(depth)) columns.set(depth, []);
    columns.get(depth).push(node);
  });

  const metrics = [...columns.entries()].sort(([a], [b]) => a - b).map(([depth, columnNodes]) => {
    const measured = columnNodes.map(node => {
      const element = getElement(node.id);
      const fallback = REAL_ICS[node.type] ? { width: 400, height: 290 } : { width: 130, height: 100 };
      return { node, width: element?.offsetWidth || fallback.width, height: element?.offsetHeight || fallback.height };
    });
    return {
      nodes: measured,
      width: Math.max(...measured.map(item => item.width)),
      height: measured.reduce((sum, item) => sum + item.height, 0) + Math.max(0, measured.length - 1) * 48,
    };
  });

  const totalHeight = Math.max(...metrics.map(column => column.height), 0);
  let currentX = 72;
  metrics.forEach(column => {
    let currentY = 96 + Math.max(0, (totalHeight - column.height) / 2);
    column.nodes.forEach(item => {
      item.node.x = snapWorld(currentX);
      item.node.y = snapWorld(currentY);
      currentY += item.height + 48;
    });
    currentX += column.width + 110;
  });

  nodes.forEach(node => {
    const element = getElement(node.id);
    if (element) {
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
    }
  });

  const bounds = nodes.reduce((result, node) => {
    const element = getElement(node.id);
    const fallback = REAL_ICS[node.type] ? { width: 400, height: 290 } : { width: 130, height: 100 };
    const width = element?.offsetWidth || fallback.width;
    const height = element?.offsetHeight || fallback.height;
    result.left = Math.min(result.left, node.x);
    result.top = Math.min(result.top, node.y);
    result.right = Math.max(result.right, node.x + width);
    result.bottom = Math.max(result.bottom, node.y + height);
    return result;
  }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

  if (workspaceRect.width && workspaceRect.height && Number.isFinite(bounds.left)) {
    const contentWidth = Math.max(1, bounds.right - bounds.left);
    const contentHeight = Math.max(1, bounds.bottom - bounds.top);
    const zoom = Math.min(1, Math.max(.45, (workspaceRect.width - 72) / contentWidth), Math.max(.45, (workspaceRect.height - 126) / contentHeight));
    setViewport({
      zoom,
      panX: (workspaceRect.width - contentWidth * zoom) / 2 - bounds.left * zoom,
      panY: 82 - bounds.top * zoom,
    });
    applyViewportTransform();
  }
  updateWires();
}
