var intersectLine = require("./intersect-line");

module.exports = intersectPolygon;

/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polygon, point) {
  var x1 = node.x;
  var y1 = node.y;

  var intersections = [];
  var points = polygon.points;

  var minx = 100000, miny = 100000;
  for (var j = 0; j < points.numberOfItems; j++) {
    var p = points.getItem(j);
    minx = Math.min(minx, p.x);
    miny = Math.min(miny, p.y);
  }

  var left = x1 - node.width / 2 - minx;
  var top =  y1 - node.height / 2 - miny;

  for (var i = 0; i < points.numberOfItems; i++) {
    var p1 = points.getItem(i);
    var p2 = points.getItem(i < points.numberOfItems - 1 ? i + 1 : 0);
    var intersect = intersectLine(node, point,
      {x: left + p1.x, y: top + p1.y}, {x: left + p2.x, y: top + p2.y});
    if (intersect) {
      intersections.push(intersect);
    }
  }

  if (!intersections.length) {
    console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
    return node;
  }

  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function(p, q) {
      var pdx = p.x - point.x,
          pdy = p.y - point.y,
          distp = Math.sqrt(pdx * pdx + pdy * pdy),

          qdx = q.x - point.x,
          qdy = q.y - point.y,
          distq = Math.sqrt(qdx * qdx + qdy * qdy);

      return (distp < distq) ? -1 : (distp === distq ? 0 : 1);
    });
  }
  return intersections[0];
}
