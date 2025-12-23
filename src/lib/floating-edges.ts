import { Position, InternalNode } from '@xyflow/react';

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getEdgeParams(source: InternalNode, target: InternalNode) {
    const sourceIntersectionPoint = getNodeIntersection(source, target);
    const targetIntersectionPoint = getNodeIntersection(target, source);

    const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
    const targetPos = getEdgePosition(target, targetIntersectionPoint);

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetIntersectionPoint.x,
        ty: targetIntersectionPoint.y,
        sp: sourcePos,
        tp: targetPos,
    };
}

function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
    // https://stackoverflow.com/questions/3305885/algorithm-to-check-if-a-rect-and-a-line-intersect

    const intersectionNodeWidth = intersectionNode.measured?.width ?? (intersectionNode.data?.width as number) ?? 100;
    const intersectionNodeHeight = intersectionNode.measured?.height ?? (intersectionNode.data?.height as number) ?? 50;
    const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
    const targetNodePosition = targetNode.internals.positionAbsolute;
    const targetNodeWidth = targetNode.measured?.width ?? (targetNode.data?.width as number) ?? 100;
    const targetNodeHeight = targetNode.measured?.height ?? (targetNode.data?.height as number) ?? 50;

    const w = intersectionNodeWidth / 2;
    const h = intersectionNodeHeight / 2;

    const x2 = targetNodePosition.x + (targetNodeWidth ?? 0) / 2;
    const y2 = targetNodePosition.y + (targetNodeHeight ?? 0) / 2;
    const x1 = intersectionNodePosition.x + w;
    const y1 = intersectionNodePosition.y + h;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
        return { x: x1, y: y1 };
    }

    const tX = dx > 0 ? w / dx : -w / dx;
    const tY = dy > 0 ? h / dy : -h / dy;

    const t = Math.min(tX, tY);

    return {
        x: x1 + t * dx,
        y: y1 + t * dy,
    };
}

function getEdgePosition(node: InternalNode, intersectionPoint: { x: number; y: number }) {
    const n = node.internals.positionAbsolute;
    const width = node.measured?.width ?? (node.data?.width as number) ?? 100;
    const height = node.measured?.height ?? (node.data?.height as number) ?? 50;

    const w = width / 2;
    const h = height / 2;

    const x = n.x + w;
    const y = n.y + h;

    if (Math.abs(x - intersectionPoint.x) > Math.abs(y - intersectionPoint.y)) {
        return intersectionPoint.x > x ? Position.Right : Position.Left;
    } else {
        return intersectionPoint.y > y ? Position.Bottom : Position.Top;
    }
}

export { getEdgeParams };
