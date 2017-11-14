/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var {
  Component,
  Component3d,
  Container,
  RectPath,
  Layout,
  TableCell
} = scene;

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'editor-table',
    label: '',
    name: '',
    property: {
    }
  }, {
    type: 'number',
    label: 'shelves',
    name: 'shelves',
    property: 'shelves'
  }, {
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

const EMPTY_BORDER = {}

function isBottomMost(idx, rows, columns) {
  return idx >= (rows - 1) * columns
}

function isRightMost(idx, rows, columns) {
  return (idx + 1) % columns == 0
}

/**
 * 1. 스타일을 상속 받아야 함. (cascade-style)
 * 2. 스타일을 동적처리할 수 있음. (로직처리)
 * 3. 데이타를 받을 수 있음.
 */
export default class RackTableCell extends RectPath(Component) {

  get nature() {
    return NATURE
  }

  set merged(merged) {
    this.set('merged', !!merged)
    if (merged)
      this.set('text', '')
  }

  get merged() {
    return this.get('merged')
  }

  set rowspan(rowspan) {
    this.set('rowspan', rowspan);
  }

  get rowspan() {
    return this.get('rowspan')
  }

  set colspan(colspan) {
    this.set('colspan', colspan);
  }

  get colspan() {
    return this.get('colspan')
  }

  get border() {
    var border = this.model.border || EMPTY_BORDER;
  }

  _drawBorder(context, x, y, to_x, to_y, style) {
    if (style && style.strokeStyle && style.lineWidth && style.lineDash) {
      context.beginPath();
      context.moveTo(x, y)
      context.lineTo(to_x, to_y);
      Component.drawStroke(context, style);
    }
  }

  _draw(context) {
    var {
      left,
      top,
      width,
      height
    } = this.model;

    var border = this.model.border || {};

    // Cell 채우기.
    context.beginPath();
    context.lineWidth = 0;
    context.rect(left, top, width, height);
    this.drawFill(context);

    // Border 그리기
    var parent = this.parent
    var idx = parent.components.indexOf(this)
    var columns = parent.columns || 1
    var rows = parent.rows || 1

    this._drawBorder(context, left, top, left + width, top, border.top);
    this._drawBorder(context, left, top + height, left, top, border.left);
    if (isRightMost(idx, rows, columns))
      this._drawBorder(context, left + width, top, left + width, top + height, border.right);
    if (isBottomMost(idx, rows, columns))
      this._drawBorder(context, left + width, top + height, left, top + height, border.bottom);
  }
}

["border"].forEach(getter => Component.memoize(RackTableCell.prototype, getter, false));

Component.register('rack-table-cell', RackTableCell);