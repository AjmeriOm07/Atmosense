import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const METEOROLOGICAL_TERMS: Record<string, { title: string; definition: string; physicsInsight: string }> = {
  pblh: {
    title: 'Planetary Boundary Layer Height (PBLH)',
    definition: 'Planetary Boundary Layer Height represents the vertical depth of the atmosphere where pollutants can mix. Lower PBLH can restrict vertical dispersion and contribute to near-surface pollutant accumulation.',
    physicsInsight: 'During nocturnal radiational cooling, PBLH can drop below 200m, trapping emissions near the ground.'
  },
  inverse_pblh: {
    title: '1/PBLH Thermal Inversion Ratio',
    definition: 'An atmospheric ratio expressing the inverse depth of the mixing layer. As PBLH decreases, 1/PBLH increases.',
    physicsInsight: 'Higher 1/PBLH values correspond directly with reduced vertical ventilation and elevated ground-level concentration.'
  },
  inversion: {
    title: 'Atmospheric Inversion',
    definition: 'An atmospheric condition where a layer of warm air traps cooler air near the surface, acting like a lid that prevents vertical air mixing.',
    physicsInsight: 'Thermal inversions lock surface emissions into a shallow air volume, causing rapid pollution build-up.'
  },
  pm25: {
    title: 'Fine Particulate Matter (PM₂.₅)',
    definition: 'Airborne particles 2.5 micrometers or smaller that remain suspended for long periods and pose deep respiratory health risks.',
    physicsInsight: 'Primary drivers include vehicular combustion, industrial output, biomass burning, and secondary aerosol formation.'
  },
  pm10: {
    title: 'Coarse Particulate Matter (PM₁₀)',
    definition: 'Inhalable dust and mechanical particles with aerodynamic diameters of 10 micrometers or smaller.',
    physicsInsight: 'Major sources include road dust resuspension, construction activity, and unpaved surface abrasion.'
  },
  o3: {
    title: 'Ground-Level Ozone (O₃)',
    definition: 'A secondary air pollutant formed through photochemical reactions between nitrogen oxides (NOx) and volatile organic compounds (VOCs) in strong sunlight.',
    physicsInsight: 'Ozone peaks during afternoon hours with strong solar radiation and elevated precursor concentrations.'
  },
  nox: {
    title: 'Nitrogen Oxides (NOx)',
    definition: 'Gaseous pollutants (NO and NO₂) primarily generated from high-temperature combustion in vehicles and industrial boilers.',
    physicsInsight: 'NOx serves as a primary chemical precursor to secondary nitrate aerosol formation and ground ozone production.'
  },
  wind_vectors: {
    title: 'Wind Dynamics Vectors (U, V)',
    definition: 'Horizontal wind components defining speed and direction (U = East-West, V = North-South).',
    physicsInsight: 'Speeds under 2.0 m/s indicate calm conditions with minimal horizontal ventilation across the region.'
  },
  dispersion: {
    title: 'Atmospheric Dispersion',
    definition: 'The rate at which atmospheric wind flow and convective turbulence dilute and spread air pollutants over spatial grids.',
    physicsInsight: 'Low boundary-layer height combined with calm wind vectors reduces atmospheric dispersion capacity.'
  },
  advection: {
    title: 'Regional Advection',
    definition: 'The horizontal transport of air masses and pollutants driven by prevailing regional wind patterns.',
    physicsInsight: 'Northwesterly advection fields transport agricultural smoke and regional emissions into the Delhi-NCR bowl.'
  },
  model_grid: {
    title: 'Model-Estimated Spatial Grid',
    definition: 'Spatial points estimated by coupled weather-chemistry forecasting models and spatial interpolation algorithms rather than ground physical sensors.',
    physicsInsight: 'Provides continuous spatial coverage across unmonitored suburban and rural entry corridors.'
  },
  aerosol_effects: {
    title: 'Aerosol Radiative & Microphysical Effects',
    definition: 'High concentrations of airborne aerosols reflect and absorb solar radiation, modifying surface energy balance and atmospheric thermal stability.',
    physicsInsight: 'Aerosol solar dimming cools the surface during daytime, dampening thermal turbulence and suppressing boundary-layer (PBLH) recovery.'
  },
  two_way_feedback: {
    title: 'Coupled Weather-Chemistry Two-Way Feedback',
    definition: 'A closed feedback loop where weather controls pollutant dispersion, and accumulated aerosols feed back to alter surface weather.',
    physicsInsight: 'Low PBLH traps PM2.5 -> Aerosols block solar radiation -> Ground surface cools -> Thermal mixing weakens -> PBLH collapses further.'
  }
};

interface InfoTooltipProps {
  termKey: keyof typeof METEOROLOGICAL_TERMS;
  titleOverride?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ termKey, titleOverride }) => {
  const [isOpen, setIsOpen] = useState(false);
  const term = METEOROLOGICAL_TERMS[termKey];

  if (!term) return null;

  return (
    <div className="relative inline-flex items-center select-none">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition-colors cursor-pointer ml-1"
        title={`Learn about ${term.title}`}
      >
        <Info className="w-2.5 h-2.5 stroke-[2.5]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-sm w-full space-y-3 relative text-slate-900 font-sans">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-900">
                  {titleOverride || term.title}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {term.definition}
            </p>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-950 space-y-1">
              <span className="font-extrabold uppercase text-[9px] text-sky-700 block">Atmosense Physics Insight</span>
              <p className="leading-relaxed font-sans">{term.physicsInsight}</p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
