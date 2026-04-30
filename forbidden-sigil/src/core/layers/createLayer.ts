import type { LayerConfig } from '../../store/layerConfigs'
import type { ILayer } from './ILayer'
import { RingLayer } from './geometric/RingLayer'
import { PolygonLayer } from './geometric/PolygonLayer'
import { StarPolygonLayer } from './geometric/StarPolygonLayer'
import { SpokesLayer } from './geometric/SpokesLayer'
import { ConcentricRingsLayer } from './geometric/ConcentricRingsLayer'
import { CrescentLayer } from './geometric/CrescentLayer'
import { SpiralArmLayer } from './geometric/SpiralArmLayer'
import { VertexMarksLayer } from './geometric/VertexMarksLayer'
import { DotChainLayer } from './decorative/DotChainLayer'
import { WavePatternLayer } from './decorative/WavePatternLayer'
import { PulseRingsLayer } from './effects/PulseRingsLayer'
import { FloatingOrbsLayer } from './effects/FloatingOrbsLayer'

export function createLayer(config: LayerConfig): ILayer {
  switch (config.type) {
    case 'ring':
      return new RingLayer(config.radius, config.thickness, config.color)
    case 'polygon':
      return new PolygonLayer(config.sides, config.radius, config.thickness, config.color)
    case 'starPolygon':
      return new StarPolygonLayer(config.points, config.skip, config.radius, config.thickness, config.color)
    case 'spokes':
      return new SpokesLayer(config.count, config.innerRadius, config.outerRadius, config.thickness, config.color)
    case 'concentricRings':
      return new ConcentricRingsLayer(config.ringCount, config.innerRadius, config.outerRadius, config.thickness, config.color)
    case 'crescent':
      return new CrescentLayer(config.radius, config.arc, config.count, config.thickness, config.color)
    case 'spiralArm':
      return new SpiralArmLayer(config.armCount, config.turns, config.innerRadius, config.outerRadius, config.thickness, config.color)
    case 'vertexMarks':
      return new VertexMarksLayer(config.vertices, config.radius, config.markSize, config.markShape, config.color)
    case 'dotChain':
      return new DotChainLayer(config.dotCount, config.radius, config.dotSize, config.alternating, config.color)
    case 'wavePattern':
      return new WavePatternLayer(config.radius, config.frequency, config.amplitude, config.waveType, config.thickness, config.color)
    case 'pulseRings':
      return new PulseRingsLayer(config.maxRadius, config.pulseSpeed, config.maxRings, config.thickness, config.color)
    case 'floatingOrbs':
      return new FloatingOrbsLayer(config.count, config.radius, config.height, config.orbSize, config.color)
  }
}
