import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Note, Folder, VortexSettings, VortexMode } from '../../types';
import { buildGraphLinks } from '../utils/vaultUtils';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Sliders,
  Compass,
  Filter,
  Eye,
  EyeOff,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface VortexGraphProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface GraphNode {
  id: string;
  note: Note;
  title: string;
  folderId: string;
  color: string;
  connectionCount: number;
  inboundCount: number;
  outboundCount: number;
  // Polar coords in vortex
  baseRadius: number;
  currentRadius: number;
  baseAngle: number;
  currentAngle: number;
  spiralArmIndex: number;
  // Cartesian coords
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  isHovered: boolean;
  isNeighbor: boolean;
  isDragging: boolean;
}

interface Particle {
  sourceId: string;
  targetId: string;
  progress: number;
  speed: number;
  color: string;
}

export const VortexGraph: React.FC<VortexGraphProps> = ({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Settings
  const [settings, setSettings] = useState<VortexSettings>({
    mode: 'galaxy',
    spinSpeed: 0.8,
    vortexPull: 1.0,
    particleSpeed: 1.0,
    showLabels: true,
    showParticles: true,
    colorMode: 'category',
    minConnections: 0,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Camera transform
  const transformRef = useRef({
    x: 0,
    y: 0,
    scale: 0.95,
  });

  // State refs for animation loop
  const nodesRef = useRef<GraphNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Map folder colors
  const folderColorMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.color));
    return map;
  }, [folders]);

  // Compute graph data
  const { links, connectionCounts, adjacencyMap } = useMemo(() => {
    return buildGraphLinks(notes);
  }, [notes]);

  // Initialize nodes in vortex configuration
  useEffect(() => {
    const total = notes.length;
    if (total === 0) {
      nodesRef.current = [];
      return;
    }

    const counts = notes.map((n) => connectionCounts.get(n.id)?.total || 0);
    const maxConn = Math.max(...counts, 1);

    const armsCount = 3; // 3 primary spiral arms in the galaxy
    const newNodes: GraphNode[] = notes.map((note, index) => {
      const conn = connectionCounts.get(note.id) || { total: 0, inbound: 0, outbound: 0 };
      const folderColor = folderColorMap.get(note.folder) || '#818cf8';

      // Hub notes sink to the center (radius: 70 - 240px)
      // Peripheral notes float at the edges (radius: 260 - 520px)
      const centralityRatio = conn.total / maxConn; // 0 to 1
      const arm = index % armsCount;

      // Distance from vortex center
      let baseRadius: number;
      if (conn.total === 0) {
        // Orphan nodes drift at the outer celestial sphere
        baseRadius = 420 + (index % 5) * 28;
      } else {
        baseRadius = 80 + (1 - centralityRatio) * 320 + (index % 4) * 15;
      }

      // Base spiral angle: logarithmic spiral arm formula
      const armOffset = (arm * 2 * Math.PI) / armsCount;
      const spiralTightness = 0.007;
      const baseAngle = armOffset + baseRadius * spiralTightness + (index * 0.45);

      // Node size: 7px to 22px depending on connections
      const size = Math.max(8, Math.min(22, 9 + conn.total * 2.4));

      return {
        id: note.id,
        note,
        title: note.title,
        folderId: note.folder,
        color: folderColor,
        connectionCount: conn.total,
        inboundCount: conn.inbound,
        outboundCount: conn.outbound,
        baseRadius,
        currentRadius: baseRadius,
        baseAngle,
        currentAngle: baseAngle,
        spiralArmIndex: arm,
        x: Math.cos(baseAngle) * baseRadius,
        y: Math.sin(baseAngle) * baseRadius,
        vx: 0,
        vy: 0,
        size,
        isHovered: false,
        isNeighbor: false,
        isDragging: false,
      };
    });

    nodesRef.current = newNodes;

    // Generate link particles
    const newParticles: Particle[] = [];
    links.forEach((link, i) => {
      // 2 particles per link
      newParticles.push({
        sourceId: link.sourceId,
        targetId: link.targetId,
        progress: (i * 0.33) % 1,
        speed: 0.004 + (i % 3) * 0.002,
        color: '#38bdf8',
      });
      newParticles.push({
        sourceId: link.sourceId,
        targetId: link.targetId,
        progress: (i * 0.33 + 0.5) % 1,
        speed: 0.004 + (i % 3) * 0.002,
        color: '#c084fc',
      });
    });
    particlesRef.current = newParticles;
  }, [notes, connectionCounts, folderColorMap, links]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.016 * settings.spinSpeed;
      }
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Save context for camera pan & zoom
      ctx.save();
      const centerX = width / 2 + transformRef.current.x;
      const centerY = height / 2 + transformRef.current.y;
      ctx.translate(centerX, centerY);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // 1. Draw Central Vortex Singularity & Accretion Halo
      const singularityGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 160 * settings.vortexPull);
      singularityGlow.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      singularityGlow.addColorStop(0.25, 'rgba(99, 102, 241, 0.22)');
      singularityGlow.addColorStop(0.65, 'rgba(6, 182, 212, 0.08)');
      singularityGlow.addColorStop(1, 'rgba(14, 16, 23, 0)');

      ctx.fillStyle = singularityGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 160 * settings.vortexPull, 0, Math.PI * 2);
      ctx.fill();

      // Draw faint vortex orbital guide rings (المدارات الكونية)
      const orbitalRadii = [80, 170, 280, 390, 480];
      orbitalRadii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = idx === 0 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.arc(0, 0, r * settings.vortexPull, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw vortex spiral dust trails (أذرع الدوامة الحلزونية)
      ctx.lineWidth = 1.2;
      for (let arm = 0; arm < 3; arm++) {
        const armAngleOffset = (arm * 2 * Math.PI) / 3 + t * 0.15;
        ctx.beginPath();
        for (let rad = 25; rad < 460; rad += 10) {
          const theta = armAngleOffset + rad * 0.007;
          const px = Math.cos(theta) * rad * settings.vortexPull;
          const py = Math.sin(theta) * rad * settings.vortexPull;
          if (rad === 25) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(129, 140, 248, 0.06)`;
        ctx.stroke();
      }

      // Draw Glowing Singularity Core
      ctx.beginPath();
      ctx.arc(0, 0, 10 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // 2. Update Node Positions according to Vortex physics
      const nodes = nodesRef.current;
      const nodeMap = new Map<string, GraphNode>();

      nodes.forEach((node) => {
        nodeMap.set(node.id, node);

        if (!node.isDragging) {
          const effectiveRadius = node.baseRadius * settings.vortexPull;
          node.currentRadius = effectiveRadius;

          // Galactic rotation: inner nodes orbit faster than outer nodes (omega = k / sqrt(r))
          const orbitalAngularSpeed = (0.28 / Math.sqrt(Math.max(40, effectiveRadius))) * 18;
          node.currentAngle = node.baseAngle + t * orbitalAngularSpeed;

          // Convert to Cartesian coordinates
          node.x = Math.cos(node.currentAngle) * effectiveRadius;
          node.y = Math.sin(node.currentAngle) * effectiveRadius;
        }
      });

      // Filter nodes based on minConnections setting
      const visibleNodes = nodes.filter((n) => n.connectionCount >= settings.minConnections);
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

      const activeHoverId = hoveredNode?.id || activeNoteId;
      const activeNeighbors = activeHoverId ? adjacencyMap.get(activeHoverId) : null;

      // 3. Draw Links between connected nodes
      links.forEach((link) => {
        if (!visibleNodeIds.has(link.sourceId) || !visibleNodeIds.has(link.targetId)) return;
        const src = nodeMap.get(link.sourceId);
        const tgt = nodeMap.get(link.targetId);
        if (!src || !tgt) return;

        const isHighlighted =
          activeHoverId &&
          (link.sourceId === activeHoverId ||
            link.targetId === activeHoverId ||
            (activeNeighbors?.has(link.sourceId) && activeNeighbors?.has(link.targetId)));

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);

        // Curve the link slightly towards the vortex center to evoke vortex gravitational bending!
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const curvePull = 0.22;
        const controlX = midX * (1 - curvePull);
        const controlY = midY * (1 - curvePull);

        ctx.quadraticCurveTo(controlX, controlY, tgt.x, tgt.y);

        if (isHighlighted) {
          ctx.strokeStyle = link.isReciprocal ? '#38bdf8' : '#a78bfa';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 8;
        } else if (activeHoverId) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = link.isReciprocal ? 'rgba(56, 189, 248, 0.28)' : 'rgba(167, 139, 250, 0.22)';
          ctx.lineWidth = 1.1;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Flowing Luminous Particles along links
      if (settings.showParticles) {
        particlesRef.current.forEach((p) => {
          if (!visibleNodeIds.has(p.sourceId) || !visibleNodeIds.has(p.targetId)) return;
          const src = nodeMap.get(p.sourceId);
          const tgt = nodeMap.get(p.targetId);
          if (!src || !tgt) return;

          if (isPlaying) {
            p.progress += p.speed * settings.particleSpeed;
            if (p.progress > 1) p.progress = 0;
          }

          // Calculate point on quadratic curve
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          const curvePull = 0.22;
          const cx = midX * (1 - curvePull);
          const cy = midY * (1 - curvePull);

          const q = p.progress;
          const invQ = 1 - q;
          const px = invQ * invQ * src.x + 2 * invQ * q * cx + q * q * tgt.x;
          const py = invQ * invQ * src.y + 2 * invQ * q * cy + q * q * tgt.y;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 5. Draw Nodes
      visibleNodes.forEach((node) => {
        const isSelected = node.id === activeNoteId;
        const isHovered = node.id === hoveredNode?.id;
        const isNeighbor = activeHoverId ? activeNeighbors?.has(node.id) || false : false;
        const isDimmed = activeHoverId && !isSelected && !isHovered && !isNeighbor;

        const alpha = isDimmed ? 0.22 : 1;
        const radius = node.size * (isHovered || isSelected ? 1.25 : 1);

        // Node Glow Halo
        if (isHovered || isSelected || node.connectionCount >= 4) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + (isHovered ? 8 : 4), 0, Math.PI * 2);
          ctx.fillStyle = isSelected
            ? 'rgba(244, 63, 94, 0.28)'
            : isHovered
            ? 'rgba(56, 189, 248, 0.35)'
            : 'rgba(168, 85, 247, 0.18)';
          ctx.fill();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDimmed ? 'rgba(40, 45, 60, 0.5)' : node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 14 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner Core Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(3, radius * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Outer Border
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.2;
        ctx.stroke();

        // 6. Draw Node Labels (Obsidian Style pills with backdrop)
        if (settings.showLabels || isHovered || isSelected || isNeighbor) {
          const fontSize = Math.max(10, Math.min(13, 10 + (transformRef.current.scale - 0.8) * 3));
          ctx.font = `500 ${fontSize}px 'Cairo', 'Plus Jakarta Sans', sans-serif`;

          const label = node.title;
          const textMetrics = ctx.measureText(label);
          const textWidth = textMetrics.width;
          const paddingX = 7;
          const paddingY = 3;
          const labelY = node.y + radius + 14;

          // Draw pill background
          ctx.fillStyle = isHovered || isSelected ? 'rgba(15, 23, 42, 0.92)' : 'rgba(15, 17, 26, 0.75)';
          ctx.strokeStyle = isHovered ? '#38bdf8' : isSelected ? '#a855f7' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;

          const pillX = node.x - textWidth / 2 - paddingX;
          const pillY = labelY - fontSize / 2 - paddingY;
          const pillW = textWidth + paddingX * 2;
          const pillH = fontSize + paddingY * 2;

          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 5);
          ctx.fill();
          ctx.stroke();

          // Draw text
          ctx.fillStyle = isDimmed ? 'rgba(200, 205, 220, 0.4)' : '#f1f5f9';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, labelY);
        }
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    notes,
    links,
    activeNoteId,
    hoveredNode,
    settings,
    isPlaying,
    adjacencyMap,
  ]);

  // Convert client mouse coordinates to world coordinates in the vortex
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2 + transformRef.current.x;
    const cy = rect.height / 2 + transformRef.current.y;
    const x = (clientX - rect.left - cx) / transformRef.current.scale;
    const y = (clientY - rect.top - cy) / transformRef.current.scale;
    return { x, y };
  }, []);

  // Mouse / Pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // Check if clicked a node
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 6;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      clickedNode.isDragging = true;
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingCanvasRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.baseRadius = Math.sqrt(x * x + y * y) / settings.vortexPull;
      draggedNodeRef.current.baseAngle = Math.atan2(y, x) - timeRef.current * 0.1;
      return;
    }

    // Hover detection
    const found = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 8;
    });

    if (found !== hoveredNode) {
      setHoveredNode(found || null);
      if (found && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setTooltipPos(null);
      }
    } else if (found && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.isDragging = false;
      draggedNodeRef.current = null;
    }
    isDraggingCanvasRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 8;
    });

    if (clickedNode) {
      onSelectNote(clickedNode.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(2.5, transformRef.current.scale * zoomFactor));
    transformRef.current.scale = newScale;
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, scale: 0.95 };
  };

  const zoomIn = () => {
    transformRef.current.scale = Math.min(2.5, transformRef.current.scale * 1.2);
  };

  const zoomOut = () => {
    transformRef.current.scale = Math.max(0.3, transformRef.current.scale * 0.8);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0a0c12] overflow-hidden select-none"
      id="vortex-graph-container"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Top Floating Header & Modes */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#131722]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 shadow-xl">
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-200">دوامة المعرفة</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              {notes.length} فكرة
            </span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-700/60 mx-1" />

          {/* Mode Selector */}
          <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-zinc-800">
            <button
              id="vortex-mode-galaxy"
              onClick={() => setSettings((s) => ({ ...s, mode: 'galaxy' }))}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                settings.mode === 'galaxy'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="أذرع لولبية تدور في فلك مجري"
            >
              المجرة اللولبية
            </button>
            <button
              id="vortex-mode-gravity"
              onClick={() => setSettings((s) => ({ ...s, mode: 'gravity' }))}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                settings.mode === 'gravity'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="تركيز الأفكار المحورية في بؤرة الجاذبية"
            >
              جاذبية النواة
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Pause / Play Rotation */}
          <button
            id="vortex-toggle-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition-all ${
              isPlaying
                ? 'bg-zinc-900/80 text-violet-400 border-zinc-800 hover:bg-zinc-800'
                : 'bg-violet-600/90 text-white border-violet-500 hover:bg-violet-600'
            }`}
            title={isPlaying ? 'إيقاف دوران الدوامة مؤقتاً' : 'استئناف الدوران'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Reset Camera */}
          <button
            id="vortex-reset-camera"
            onClick={resetView}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 backdrop-blur-md shadow-lg transition-all"
            title="إعادة ضبط زاوية الرؤية"
          >
            <RotateCcw size={16} />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-zinc-900/80 rounded-xl border border-zinc-800 backdrop-blur-md p-0.5 shadow-lg">
            <button
              id="vortex-zoom-in"
              onClick={zoomIn}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-all"
              title="تكبير"
            >
              <ZoomIn size={15} />
            </button>
            <button
              id="vortex-zoom-out"
              onClick={zoomOut}
              className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-all"
              title="تصغير"
            >
              <ZoomOut size={15} />
            </button>
          </div>

          {/* Toggle Labels */}
          <button
            id="vortex-toggle-labels"
            onClick={() => setSettings((s) => ({ ...s, showLabels: !s.showLabels }))}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
              settings.showLabels
                ? 'bg-zinc-900/80 text-cyan-400 border-zinc-800 hover:bg-zinc-800'
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-800/60'
            }`}
            title={settings.showLabels ? 'إخفاء العناوين' : 'إظهار جميع العناوين'}
          >
            {settings.showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {/* Settings Drawer Toggle */}
          <button
            id="vortex-toggle-settings"
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
              showControls
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
            title="تعديل فيزياء الدوامة"
          >
            <Sliders size={16} />
          </button>

          {onToggleFullscreen && (
            <button
              id="vortex-toggle-fullscreen"
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 backdrop-blur-md shadow-lg transition-all"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Vortex Physics Customizer Drawer */}
      {showControls && (
        <div
          id="vortex-settings-panel"
          className="absolute top-16 right-4 w-72 bg-[#121520]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-4 shadow-2xl z-20 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-violet-400" />
              فيزياء وضوابط الدوامة
            </span>
            <span className="text-[11px] text-zinc-500">60 FPS</span>
          </div>

          {/* Spin Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">سرعة الدوران الفلكي</span>
              <span className="text-violet-400 font-mono">{settings.spinSpeed.toFixed(1)}x</span>
            </div>
            <input
              id="vortex-spin-slider"
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={settings.spinSpeed}
              onChange={(e) => setSettings({ ...settings, spinSpeed: parseFloat(e.target.value) })}
              className="w-full accent-violet-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Vortex Gravity Pull */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">شدة الجذب نحو المركز</span>
              <span className="text-cyan-400 font-mono">{settings.vortexPull.toFixed(1)}x</span>
            </div>
            <input
              id="vortex-pull-slider"
              type="range"
              min="0.4"
              max="1.8"
              step="0.1"
              value={settings.vortexPull}
              onChange={(e) => setSettings({ ...settings, vortexPull: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Filter by connections */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">تصفية حسب عدد الروابط الأدنى</span>
              <span className="text-amber-400 font-mono">{settings.minConnections}+</span>
            </div>
            <input
              id="vortex-filter-slider"
              type="range"
              min="0"
              max="4"
              step="1"
              value={settings.minConnections}
              onChange={(e) => setSettings({ ...settings, minConnections: parseInt(e.target.value) })}
              className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs">
            <label className="flex items-center justify-between cursor-pointer text-zinc-300">
              <span>تيارات الطاقة والجسيمات اللامعة</span>
              <input
                type="checkbox"
                checked={settings.showParticles}
                onChange={(e) => setSettings({ ...settings, showParticles: e.target.checked })}
                className="rounded accent-violet-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Hover Node Tooltip Card */}
      {hoveredNode && tooltipPos && (
        <div
          id="vortex-node-tooltip"
          className="absolute pointer-events-auto bg-[#141724]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-3 shadow-2xl z-30 max-w-xs transition-opacity duration-150"
          style={{
            left: Math.min(window.innerWidth - 300, Math.max(16, tooltipPos.x + 14)),
            top: Math.min(window.innerHeight - 180, Math.max(60, tooltipPos.y - 40)),
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <h4 className="text-sm font-semibold text-zinc-100">{hoveredNode.title}</h4>
            </div>
            <button
              onClick={() => onSelectNote(hoveredNode.id)}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="فتح الملاحظة في المحرر"
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
            {hoveredNode.note.content
              .replace(/#+\s+/g, '')
              .replace(/\[\[|\]\]/g, '')
              .slice(0, 120)}
            ...
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="text-cyan-400 font-semibold">{hoveredNode.connectionCount}</span>
              روابط بالدوامة
            </span>
            <span className="text-zinc-500">
              {hoveredNode.inboundCount} واردة / {hoveredNode.outboundCount} صادرة
            </span>
          </div>
        </div>
      )}

      {/* Bottom Information / Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-[#131722]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 text-xs text-zinc-400 z-10 pointer-events-none">
        <span className="text-zinc-500">مفتاح الدوامة:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7]"></span>
          <span>النواة (أعلى ترابط)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>المدار المتوسط</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
          <span>الأطراف الخارجية</span>
        </div>
      </div>
    </div>
  );
};
