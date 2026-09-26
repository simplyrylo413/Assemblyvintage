import { useEffect, useState } from 'react'
import './liquid-countdown.css'

const SLOGANS = [
  "LET'S SHOP!",
  'HAPPY HUNTING',
  'VINTAGE AWAITS',
  'FIND SOMETHING GOOD',
  'THE HUNT IS ON',
]

function sloganSize(phrase) {
  if (phrase.length >= 19) return 70
  if (phrase.length >= 15) return 80
  if (phrase.length >= 12) return 92
  return 112
}

export function LiquidCountdown() {
  const [started, setStarted] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const intro = window.setTimeout(() => setStarted(true), 2050)
    return () => window.clearTimeout(intro)
  }, [])

  useEffect(() => {
    if (!started) return undefined
    const loop = window.setInterval(() => {
      setPhraseIndex((index) => (index + 1) % SLOGANS.length)
    }, 5200)
    return () => window.clearInterval(loop)
  }, [started])

  const phrase = SLOGANS[phraseIndex]
  const fontSize = sloganSize(phrase)

  return (
    <div className="liquid-countdown" aria-live="polite">
      <svg
        className="liquid-countdown__svg"
        viewBox="0 0 900 280"
        role="img"
        aria-label={started ? `The market is open. ${phrase}` : 'Countdown complete. The timer is melting.'}
      >
        <defs>
          <linearGradient id="mercuryFill" x1="0" y1="0" x2="900" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#141210" />
            <stop offset="10%" stopColor="#5f5952" />
            <stop offset="20%" stopColor="#f7efe3" />
            <stop offset="31%" stopColor="#7b7168" />
            <stop offset="42%" stopColor="#fffdf8" />
            <stop offset="54%" stopColor="#302d2a" />
            <stop offset="66%" stopColor="#cfc3b5" />
            <stop offset="78%" stopColor="#f8f0e5" />
            <stop offset="89%" stopColor="#625b55" />
            <stop offset="100%" stopColor="#171513" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-170 0;170 0;-170 0"
              dur="6.5s"
              repeatCount="indefinite"
            />
          </linearGradient>

          <radialGradient id="puddleGlow" cx="46%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fffdf9" stopOpacity=".96" />
            <stop offset="17%" stopColor="#b7aa9d" stopOpacity=".95" />
            <stop offset="43%" stopColor="#3b3733" stopOpacity=".98" />
            <stop offset="66%" stopColor="#f1e9df" stopOpacity=".9" />
            <stop offset="100%" stopColor="#141210" />
          </radialGradient>

          <filter id="liquidMetal" x="-28%" y="-45%" width="156%" height="205%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.007 0.028"
              numOctaves="2"
              seed="12"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.006 0.022;0.012 0.041;0.008 0.03;0.006 0.022"
                dur="7s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="B"
              result="distorted"
            >
              <animate
                attributeName="scale"
                values="6;13;9;15;6"
                dur="5.2s"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
            <feGaussianBlur in="distorted" stdDeviation=".45" result="softMetal" />
            <feSpecularLighting
              in="softMetal"
              surfaceScale="8"
              specularConstant="1.15"
              specularExponent="24"
              lightingColor="#fffaf1"
              result="specular"
            >
              <feDistantLight azimuth="228" elevation="57" />
            </feSpecularLighting>
            <feComposite in="specular" in2="softMetal" operator="in" result="specularCut" />
            <feBlend in="softMetal" in2="specularCut" mode="screen" />
          </filter>

          <filter id="puddleMetal" x="-22%" y="-70%" width="144%" height="240%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.045" numOctaves="2" seed="5" result="puddleNoise">
              <animate
                attributeName="baseFrequency"
                values="0.006 0.03;0.012 0.055;0.007 0.038;0.006 0.03"
                dur="4.2s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="puddleNoise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
              result="puddleDistort"
            >
              <animate attributeName="scale" values="10;23;15;20;10" dur="4.8s" repeatCount="indefinite" />
            </feDisplacementMap>
            <feGaussianBlur in="puddleDistort" stdDeviation=".75" result="puddleSoft" />
            <feSpecularLighting
              in="puddleSoft"
              surfaceScale="9"
              specularConstant="1.3"
              specularExponent="28"
              lightingColor="#fff8ed"
              result="puddleSpec"
            >
              <feDistantLight azimuth="214" elevation="64" />
            </feSpecularLighting>
            <feComposite in="puddleSpec" in2="puddleSoft" operator="in" result="puddleSpecCut" />
            <feBlend in="puddleSoft" in2="puddleSpecCut" mode="screen" />
          </filter>
        </defs>

        {!started && (
          <g className="liquid-zero-clock" filter="url(#liquidMetal)">
            <text className="liquid-zero-clock__numbers" x="450" y="118" textAnchor="middle">
              00 : 00 : 00 : 00
            </text>
            <g className="liquid-zero-clock__labels" textAnchor="middle">
              <text x="170" y="153">DAYS</text>
              <text x="360" y="153">HOURS</text>
              <text x="548" y="153">MINUTES</text>
              <text x="736" y="153">SECONDS</text>
            </g>
          </g>
        )}

        <g className={`liquid-puddle ${started ? 'liquid-puddle--loop' : 'liquid-puddle--intro'}`} filter="url(#puddleMetal)">
          <path
            d="M132 224 C182 209 257 213 302 218 C347 223 382 213 431 215 C492 218 526 207 582 213 C640 220 710 211 770 225 C724 245 656 248 591 244 C530 241 489 251 430 247 C367 243 318 251 260 246 C206 242 161 239 132 224 Z"
            fill="url(#puddleGlow)"
          />
          <ellipse className="liquid-puddle__shine" cx="430" cy="224" rx="206" ry="9" fill="#fffdf7" opacity=".38" />
        </g>

        {started && (
          <g key={phraseIndex} className="liquid-slogan">
            <text
              className="liquid-slogan__shadow"
              x="450"
              y="151"
              textAnchor="middle"
              fontSize={fontSize}
            >
              {phrase}
            </text>
            <text
              className="liquid-slogan__metal"
              x="450"
              y="147"
              textAnchor="middle"
              fontSize={fontSize}
              fill="url(#mercuryFill)"
              filter="url(#liquidMetal)"
            >
              {phrase}
            </text>
            <text
              className="liquid-slogan__edge"
              x="450"
              y="145"
              textAnchor="middle"
              fontSize={fontSize}
            >
              {phrase}
            </text>
          </g>
        )}

        {started && (
          <g className="liquid-droplets" aria-hidden="true">
            {[
              [248, 169, 6, 0.0],
              [324, 183, 4, 0.13],
              [389, 164, 5, 0.22],
              [476, 178, 4, 0.08],
              [536, 162, 6, 0.18],
              [610, 181, 4, 0.28],
              [667, 170, 5, 0.34],
            ].map(([cx, cy, r, delay], index) => (
              <circle
                key={index}
                className="liquid-droplet"
                cx={cx}
                cy={cy}
                r={r}
                fill="url(#mercuryFill)"
                filter="url(#liquidMetal)"
                style={{ '--drop-delay': `${delay}s` }}
              />
            ))}
          </g>
        )}
      </svg>

      <span className="liquid-countdown__status">
        {started ? 'THE MARKET IS OPEN' : '00:00 — OPENING THE MARKET'}
      </span>
    </div>
  )
}
