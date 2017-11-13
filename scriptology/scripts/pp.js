﻿#target estoolkit
#target photoshop
#include common.js

var sheetFilePath = '~/Projects/allmyart/scriptology/visuarea_dimensions.csv'
var logoFilePath = '~/Projects/allmyart/scriptology/logo+site.tif'

var OUTER_FRAME_SIZE = 3 // cm
// var INNER_FRAME_SIZE = 3.5 // cm
var LINE_SIDE_MARGIN = 8.7 // cm
var DOTS_SIDE_MARGIN = 0.5 // cm
var DOT_RADIUS = 4 // px

var OUTER_FRAME_LAYER_NAME = 'all black'
var INNER_FRAME_LAYER_NAME = 'all princess'
var LINES_DOTS_LAYER_NAME = 'lines & dots'

var COLORS = {}
function initColors () {
  var whiteColor = new SolidColor()
  whiteColor.cmyk.cyan = 0
  whiteColor.cmyk.magenta = 0
  whiteColor.cmyk.yellow = 0
  whiteColor.cmyk.black = 0

  COLORS['white'] = whiteColor

  var blackColor = new SolidColor()
  blackColor.cmyk.cyan = 75
  blackColor.cmyk.magenta = 68
  blackColor.cmyk.yellow = 67
  blackColor.cmyk.black = 90

  COLORS['black'] = blackColor

  var princess1Color = new SolidColor()
  princess1Color.cmyk.cyan = 55
  princess1Color.cmyk.magenta = 1
  princess1Color.cmyk.yellow = 1
  princess1Color.cmyk.black = 1

  var princess2Color = new SolidColor()
  princess2Color.cmyk.cyan = 20
  princess2Color.cmyk.magenta = 66
  princess2Color.cmyk.yellow = 1
  princess2Color.cmyk.black = 1

  var princess3Color = new SolidColor()
  princess3Color.cmyk.cyan = 1
  princess3Color.cmyk.magenta = 14
  princess3Color.cmyk.yellow = 88
  princess3Color.cmyk.black = 1

  COLORS['princess'] = [princess1Color, princess2Color, princess3Color]
}

function showDialogWindow (defaultPicture, callback, secondAttempt) {
  var dialogTitle = secondAttempt
    ? 'Are you dump?'
    : 'Give me the info bitch!'

  var win = new Window ('dialog', dialogTitle)
  win.alignChildren = 'left'
  win.orientation = 'column'
  win.size = { width: 245, height: 170 }

  var skuPanel = win.skuPanel = win.add('panel')
  skuPanel.orientation = 'row'
  var skuLabel = win.skuLabel = skuPanel.add('statictext', [0, 0, 35, 20], 'Sku:')
  var skuField = win.skuField = skuPanel.add('edittext', [0, 0, 70, 20], defaultPicture)
  skuField.active = true
  skuField.minimalSize = [80, 20]

  skuLabel.location = [10, 10]
  skuField.location = [60, 10]

  var sizePanel = win.sizePanel = win.add('panel')
  sizePanel.orientation = 'row'
  var sizeLabel = win.sizeLabel = sizePanel.add('statictext', [0, 0, 35, 20], 'Size:')
  var size1Field = win.size1Field = sizePanel.add('radiobutton', [0, 0, 50, 20], '3cm')
  win.size1Field.value = true
  var size2Field = win.size2Field = sizePanel.add('radiobutton', [0, 0, 80, 20], '3.5cm')

  win.okButton = win.add('button', undefined, 'OK')

  win.okButton.onClick = function() {
    win.hide()

    var size = new UnitValue(size1Field.value ? 3 : 3.5, 'cm')
    var sku = skuField.text

    if (!sku) {
      showDialogWindow(defaultPicture, callback, true)
    }

    callback(sku, size)

    return false
  }

  win.show()

  return win
}

function pictureInfoGotten (sku, size) {
  var modulesDefinition = findModulesByFileName(sku)

  createModulesFrames(modulesDefinition, size)
  insertLogo()
}

function parseModulesDefinition (line) {
  if (!line) {
    return null
  }

  var split = line.split(';')
  if (split.length === 1) {
    alert('Something wrong with a line from the sheet: `' + line + '`')
    return null
  }

  // the first chunk is a name
  var name = split[0]
  split = split.slice(1)

  // others — modules width and height
  var i = 0
  var modules = []
  var w, h
  while (i + 1 < split.length) {
    w = parseInt(split[i], 10)
    h = parseInt(split[i + 1], 10)
    if (w === 0 || h === 0) {
      break
    }

    modules.push([w, h])
    i += 2
  }

  return {
    name: name,
    modules: modules,
  }
}

function findModulesByFileName (fileName) {
  var fileDescriptor = new File(sheetFilePath)
  fileDescriptor.open('r')

  var line = '';
  while (!fileDescriptor.eof) {
    line = fileDescriptor.readln()
    if (line.indexOf(fileName) > -1) {
      break
    }
  }

  fileDescriptor.close()

  if (!line) {
    alert('No file `' + fileName + '` found in the sheet.')
    return null
  }

  return parseModulesDefinition(line)
}

function drawBorder (bounds, size, color, opacity) {
  _select([
    [bounds.left.as('px'), bounds.top.as('px')],
    [bounds.left.as('px'), bounds.bottom.as('px')],
    [bounds.right.as('px'), bounds.bottom.as('px')],
    [bounds.right.as('px'), bounds.top.as('px')],
  ])

  activeDocument.selection.fill(color, ColorBlendMode.COLOR, opacity)

  var borderSizeCm = new UnitValue(size, 'cm')

  _select([
    [(bounds.left + borderSizeCm).as('px'), (bounds.top + borderSizeCm).as('px')],
    [(bounds.left + borderSizeCm).as('px'), (bounds.bottom - borderSizeCm).as('px')],
    [(bounds.right - borderSizeCm).as('px'), (bounds.bottom - borderSizeCm).as('px')],
    [(bounds.right - borderSizeCm).as('px'), (bounds.top + borderSizeCm).as('px')],
  ])

  _deleteArea()
  _deselect()
}


function drawFramesInDocument (frameDocument, innerFrameSize) {
  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  var blackLayer = frameDocument.artLayers.add()
  blackLayer.name = OUTER_FRAME_LAYER_NAME

  drawBorder(blackBounds, OUTER_FRAME_SIZE, COLORS['black'], 100)

  var princessLayer = frameDocument.artLayers.add()
  princessLayer.name = INNER_FRAME_LAYER_NAME

  var princessBounds = {
    left: blackBounds.left + OUTER_FRAME_SIZE,
    top: blackBounds.top + OUTER_FRAME_SIZE,
    right: blackBounds.right - OUTER_FRAME_SIZE,
    bottom: blackBounds.bottom - OUTER_FRAME_SIZE,
  }

  var princessColor = COLORS['princess'][Math.floor(Math.random() * COLORS['princess'].length)]
  drawBorder(princessBounds, innerFrameSize, princessColor, 40)

  drawCornerLines(frameDocument)

  drawDots(frameDocument)
}

function _drawLine (startXY, endXY, width) {
  var desc = new ActionDescriptor()
  var lineDesc = new ActionDescriptor()
  var startDesc = new ActionDescriptor()
  startDesc.putUnitDouble(c('Hrzn'), c('#Pxl'), startXY[0])
  startDesc.putUnitDouble(c('Vrtc'), c('#Pxl'), startXY[1])
  lineDesc.putObject(c('Strt'), c('Pnt '), startDesc)
  var endDesc = new ActionDescriptor()
  endDesc.putUnitDouble(c('Hrzn'), c('#Pxl'), endXY[0])
  endDesc.putUnitDouble(c('Vrtc'), c('#Pxl'), endXY[1])
  lineDesc.putObject(c('End '), c('Pnt '), endDesc)
  lineDesc.putUnitDouble(c('Wdth'), c('#Pxl'), width)
  desc.putObject(c('Shp '), c('Ln  '), lineDesc)
  desc.putBoolean(c('AntA'), true)
  executeAction(c('Draw'), desc, DialogModes.NO)
}

function drawCornerLines (frameDocument) {
  var linesLayer = frameDocument.artLayers.add()
  linesLayer.name = LINES_DOTS_LAYER_NAME

  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  app.foregroundColor = COLORS['white']

  var strokeWidth = new UnitValue(2, 'px')

  // top-left
  _drawLine([
      (blackBounds.left + LINE_SIDE_MARGIN).as('px'),
      (blackBounds.top).as('px')
    ], [
      (blackBounds.left).as('px'),
      (blackBounds.top + LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // top-right
  _drawLine([
      (blackBounds.right - LINE_SIDE_MARGIN).as('px'),
      (blackBounds.top).as('px')
    ], [
      (blackBounds.right).as('px'),
      (blackBounds.top + LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // bottom-right
  _drawLine([
      (blackBounds.right - LINE_SIDE_MARGIN).as('px'),
      (blackBounds.bottom).as('px')
    ], [
      (blackBounds.right).as('px'),
      (blackBounds.bottom - LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // bottom-left
  _drawLine([
      (blackBounds.left + LINE_SIDE_MARGIN).as('px'),
      (blackBounds.bottom).as('px')
    ], [
      (blackBounds.left).as('px'),
      (blackBounds.bottom - LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )
}

function drawDot (centerX, centerY) {
  _selectWithEllipse({
    left: new UnitValue(centerX - DOT_RADIUS, 'px'),
    top: new UnitValue(centerY - DOT_RADIUS, 'px'),
    right: new UnitValue(centerX + DOT_RADIUS, 'px'),
    bottom: new UnitValue(centerY + DOT_RADIUS, 'px'),
  })

  activeDocument.selection.fill(app.foregroundColor, ColorBlendMode.COLOR, 100)
  _deselect()
}

function drawDots (frameDocument) {
  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  var verticalCenterY = blackBounds.bottom / 2
  var horizontalCenterY = blackBounds.right / 2

  var dotsSideMarginCm = new UnitValue(DOTS_SIDE_MARGIN, 'cm')

  var addition = new UnitValue(0, 'cm')
  var leftX = (blackBounds.left + dotsSideMarginCm).as('px')
  var rightX = (blackBounds.right - dotsSideMarginCm).as('px')
  while (verticalCenterY + addition < blackBounds.bottom) {
    drawDot(leftX, (verticalCenterY + addition).as('px'))
    drawDot(rightX, (verticalCenterY + addition).as('px'))
    if (addition.value !== 0) {
      drawDot(leftX, (verticalCenterY - addition).as('px'))
      drawDot(rightX, (verticalCenterY - addition).as('px'))
    }

    addition += 6
  }

  addition = new UnitValue(0, 'cm')
  var topY = (blackBounds.top + dotsSideMarginCm).as('px')
  var bottomY = (blackBounds.bottom - dotsSideMarginCm).as('px')
  while (horizontalCenterY + addition < blackBounds.right) {
    drawDot((horizontalCenterY + addition).as('px'), topY)
    drawDot((horizontalCenterY + addition).as('px'), bottomY)
    if (addition.value !== 0) {
      drawDot((horizontalCenterY - addition).as('px'), topY)
      drawDot((horizontalCenterY - addition).as('px'), bottomY)
    }

    addition += 6
  }
}

/**
 *
 * @param modulesDefinition
 * @param [modulesDefinition.name]
 * @param [modulesDefinition.modules] Array<Array<number, number>>
 */
function createModulesFrames (modulesDefinition, innerFrameSize) {
  var frames = modulesDefinition.modules
  var frame, frameName
  var resolution = 150
  var w, h;
  for (var i = 0; i < frames.length; i++) {
    frame = frames[i]
    frameName = modulesDefinition.name + '-' + i
    $.writeln('Creating frame ', frameName + ' ', frame[0] + 'cm' + ' ', frame[1] + 'cm')

    UnitValue.baseUnit = UnitValue (1 / resolution, 'in')

    w = new UnitValue(frame[0] + OUTER_FRAME_SIZE * 2 + innerFrameSize * 2, 'cm')
    h = new UnitValue(frame[1] + OUTER_FRAME_SIZE * 2 + innerFrameSize * 2, 'cm')
    var frameDocument = documents.add(
      w,                          // width
      h,                          // height
      resolution,                 // resolution
      frameName,                  // name
      NewDocumentMode.CMYK,       // mode
      DocumentFill.TRANSPARENT,   // initialFill
      1.0,                        // pixelAspectRatio
      BitsPerChannelType.SIXTEEN  // bitsPerChannel
    )

    drawFramesInDocument(frameDocument, innerFrameSize)
    insertModuleNumber(frameDocument, i + 1)
    return
  }
}

function insertModuleNumber (frameDocument, moduleNumber) {
  var layer = frameDocument.artLayers.add()
  layer.kind = LayerKind.TEXT
  layer.name = 'module number'
  layer.rotate(180)

  var textItem = layer.textItem
  textItem.contents = moduleNumber.toString()
  textItem.size = new UnitValue(40, 'pt')
  textItem.font = 'MuseoSansCyrl-300'
  textItem.justification = Justification.CENTER;
  textItem.kind = TextType.PARAGRAPHTEXT;
  textItem.color = COLORS['white']

  var layerBounds = _getLayerBounds(layer)
  layer.translate(
    frameDocument.width / 2 - layerBounds.left - layerBounds.width / 2,
    - layerBounds.top + new UnitValue(1.3, 'cm')
  )
}


function _selectWithEllipse (bounds) {
  var desc171 = new ActionDescriptor()
  var ref79 = new ActionReference()
  ref79.putProperty(c('Chnl'), c('fsel'))
  desc171.putReference(c('null'), ref79)
  var desc172 = new ActionDescriptor()
  desc172.putUnitDouble(c('Top '), c('#Pxl'), bounds.top)
  desc172.putUnitDouble(c('Left'), c('#Pxl'), bounds.left)
  desc172.putUnitDouble(c('Btom'), c('#Pxl'), bounds.bottom)
  desc172.putUnitDouble(c('Rght'), c('#Pxl'), bounds.right)
  desc171.putObject(c('T   '), c('Elps'), desc172)
  desc171.putBoolean(c('AntA'), true)
  executeAction(c('setd'), desc171, DialogModes.NO)
}

function insertLogo () {
  var logoLayer = _placeImageOnNewLayer(logoFilePath)
  var logoLayerBounds = _getLayerBounds(logoLayer)

  // place the layer 1cm below the upper edge of bottom outer border side
  var deltaY = activeDocument.height
    - logoLayerBounds.bottom
    - OUTER_FRAME_SIZE
    + 1
    + logoLayerBounds.height

  _moveLayer(logoLayer, 0, deltaY.as('px'))
}

function beginMagic () {
  initColors()

  app.preferences.typeUnits = TypeUnits.POINTS
  showDialogWindow('', pictureInfoGotten)
}

beginMagic()
