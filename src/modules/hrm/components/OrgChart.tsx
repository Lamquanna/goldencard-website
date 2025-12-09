'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Users,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHRMStore } from '../store';
import { Employee, OrgChartNode, EMPLOYEE_STATUS_CONFIG } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface OrgChartProps {
  rootEmployeeId?: string;
  onEmployeeClick?: (employee: Employee) => void;
  maxDepth?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Build org chart tree from employees
const buildOrgTree = (
  employees: Employee[],
  parentId: string | null,
  expandedNodes: Set<string>,
  maxDepth: number,
  currentDepth: number = 0
): OrgChartNode[] => {
  if (currentDepth >= maxDepth) return [];

  return employees
    .filter((e) => {
      if (parentId === null) {
        return !e.managerId;
      }
      return e.managerId === parentId;
    })
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      position: employee.position?.name || 'Chưa xác định',
      department: employee.department?.name || 'Chưa xác định',
      avatar: employee.avatar,
      email: employee.email,
      children: buildOrgTree(
        employees,
        employee.id,
        expandedNodes,
        maxDepth,
        currentDepth + 1
      ),
      isExpanded: expandedNodes.has(employee.id),
    }));
};

// ============================================================================
// ORG CHART NODE COMPONENT
// ============================================================================

interface OrgChartNodeComponentProps {
  node: OrgChartNode;
  level: number;
  isLast: boolean;
  onToggle: (nodeId: string) => void;
  onClick?: (nodeId: string) => void;
  zoomLevel: number;
}

function OrgChartNodeComponent({
  node,
  level,
  isLast,
  onToggle,
  onClick,
  zoomLevel,
}: OrgChartNodeComponentProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = node.isExpanded;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className="relative"
      >
        <Card
          className={cn(
            'min-w-[200px] max-w-[280px] cursor-pointer transition-all hover:shadow-lg',
            'border-2 hover:border-primary/50'
          )}
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={() => onClick?.(node.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-zinc-100 dark:ring-zinc-800">
                <AvatarImage src={node.avatar} alt={node.name} />
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                  {getInitials(node.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {node.name}
                </h4>
                <p className="text-xs text-primary truncate">{node.position}</p>
                <p className="text-xs text-zinc-500 truncate">{node.department}</p>
              </div>
            </div>

            {/* Contact Info */}
            {node.email && (
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{node.email}</span>
                </div>
              </div>
            )}

            {/* Expand/Collapse Button */}
            {hasChildren && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white dark:bg-zinc-900 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(node.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}

            {/* Children Count Badge */}
            {hasChildren && !isExpanded && (
              <Badge
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-5 px-1.5 text-[10px]"
              >
                <Users className="h-2.5 w-2.5 mr-0.5" />
                {node.children.length}
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* Connector Line */}
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

            {/* Horizontal Line */}
            {node.children.length > 1 && (
              <div
                className="h-px bg-zinc-200 dark:bg-zinc-700"
                style={{
                  width: `calc(${(node.children.length - 1) * 100}% + ${(node.children.length - 1) * 32}px)`,
                }}
              />
            )}

            {/* Children Nodes */}
            <div className="flex gap-8">
              {node.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical Connector */}
                  <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />

                  <OrgChartNodeComponent
                    node={child}
                    level={level + 1}
                    isLast={index === node.children.length - 1}
                    onToggle={onToggle}
                    onClick={onClick}
                    zoomLevel={zoomLevel}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TREE VIEW (Alternative Compact View)
// ============================================================================

interface TreeViewNodeProps {
  node: OrgChartNode;
  level: number;
  onToggle: (nodeId: string) => void;
  onClick?: (nodeId: string) => void;
}

function TreeViewNode({ node, level, onToggle, onClick }: TreeViewNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = node.isExpanded;

  return (
    <div>
      {/* Node Row */}
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => onClick?.(node.id)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-5" />
        )}

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={node.avatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(node.name)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {node.name}
            </span>
            {hasChildren && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {node.children.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="truncate">{node.position}</span>
            <span>•</span>
            <span className="truncate">{node.department}</span>
          </div>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeViewNode
                key={child.id}
                node={child}
                level={level + 1}
                onToggle={onToggle}
                onClick={onClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type ViewMode = 'chart' | 'tree';

export default function OrgChart({
  rootEmployeeId,
  onEmployeeClick,
  maxDepth = 5,
}: OrgChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { employees, selectEmployee } = useHRMStore();

  // Build org tree
  const orgTree = useMemo(() => {
    // Start from root (CEO/no manager) or specific employee
    let startId = rootEmployeeId || null;
    
    // If rootEmployeeId is provided, find all descendants
    if (rootEmployeeId) {
      return buildOrgTree(employees, rootEmployeeId, expandedNodes, maxDepth, 0);
    }

    // Otherwise, build from top-level employees (no manager)
    return buildOrgTree(employees, null, expandedNodes, maxDepth, 0);
  }, [employees, rootEmployeeId, expandedNodes, maxDepth]);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    const employee = employees.find((e) => e.id === nodeId);
    if (employee) {
      selectEmployee(employee);
      onEmployeeClick?.(employee);
    }
  }, [employees, selectEmployee, onEmployeeClick]);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set(employees.map((e) => e.id));
    setExpandedNodes(allIds);
  }, [employees]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'chart' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('chart')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Sơ đồ
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('tree')}
            >
              <Users className="h-4 w-4 mr-2" />
              Danh sách
            </Button>
          </div>

          {/* Expand/Collapse */}
          <Button variant="outline" size="sm" onClick={handleExpandAll}>
            Mở rộng tất cả
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}>
            Thu gọn
          </Button>
        </div>

        {/* Zoom Controls (Chart view only) */}
        {viewMode === 'chart' && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thu nhỏ</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-sm text-zinc-500 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Phóng to</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleResetZoom}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đặt lại</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Chart/Tree View */}
      <Card>
        <CardContent className="p-6">
          {orgTree.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Chưa có dữ liệu sơ đồ tổ chức
              </h3>
              <p className="text-sm text-zinc-500">
                Thêm nhân viên và thiết lập cấu trúc quản lý để xem sơ đồ tổ chức
              </p>
            </div>
          ) : viewMode === 'chart' ? (
            <div
              ref={containerRef}
              className="overflow-auto min-h-[400px] py-8"
            >
              <div className="inline-flex flex-col items-center min-w-full">
                {orgTree.map((node, index) => (
                  <OrgChartNodeComponent
                    key={node.id}
                    node={node}
                    level={0}
                    isLast={index === orgTree.length - 1}
                    onToggle={handleToggle}
                    onClick={handleNodeClick}
                    zoomLevel={zoomLevel}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y dark:divide-zinc-800">
              {orgTree.map((node) => (
                <TreeViewNode
                  key={node.id}
                  node={node}
                  level={0}
                  onToggle={handleToggle}
                  onClick={handleNodeClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {employees.length}
                </p>
                <p className="text-xs text-zinc-500">Tổng nhân viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {useHRMStore.getState().departments.length}
                </p>
                <p className="text-xs text-zinc-500">Phòng ban</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {useHRMStore.getState().positions.length}
                </p>
                <p className="text-xs text-zinc-500">Chức vụ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {employees.filter((e) => !e.managerId).length}
                </p>
                <p className="text-xs text-zinc-500">Quản lý cấp cao</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
