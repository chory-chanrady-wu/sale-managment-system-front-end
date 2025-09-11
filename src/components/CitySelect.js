//import React, { useState } from "react";
import Select from "react-select";
// Cities with Khmer labels
const cities = [
  { label: "បន្ទាយមានជ័យ (Banteay Meanchey)", value: "Banteay Meanchey" },
  { label: "បាត់ដំបង (Battambang)", value: "Battambang" },
  { label: "កំពង់ចាម (Kampong Cham)", value: "Kampong Cham" },
  { label: "កំពង់ឆ្នាំង (Kampong Chhnang)", value: "Kampong Chhnang" },
  { label: "កំពង់ស្ពឺ (Kampong Speu)", value: "Kampong Speu" },
  { label: "កំពង់ធំ (Kampong Thom)", value: "Kampong Thom" },
  { label: "កំពត (Kampot)", value: "Kampot" },
  { label: "កណ្តាល (Kandal)", value: "Kandal" },
  { label: "កែប (Kep)", value: "Kep" },
  { label: "កោះកុង (Koh Kong)", value: "Koh Kong" },
  { label: "ក្រចេះ (Kratié)", value: "Kratié" },
  { label: "មណ្ឌលគិរី (Mondulkiri)", value: "Mondulkiri" },
  { label: "ឧត្ដរមានជ័យ (Oddar Meanchey)", value: "Oddar Meanchey" },
  { label: "ប៉ៃលិន (Pailin)", value: "Pailin" },
  { label: "ភ្នំពេញ (Phnom Penh)", value: "Phnom Penh" },
  { label: "ព្រះវិហារ (Preah Vihear)", value: "Preah Vihear" },
  { label: "ព្រៃវែង (Prey Veng)", value: "Prey Veng" },
  { label: "ពោធិ៍សាត់ (Pursat)", value: "Pursat" },
  { label: "រតនគិរី (Ratanakiri)", value: "Ratanakiri" },
  { label: "សៀមរាប (Siem Reap)", value: "Siem Reap" },
  { label: "ព្រះសីហនុ (Preah Sihanouk)", value: "Preah Sihanouk" },
  { label: "ស្ទឹងត្រែង (Stung Treng)", value: "Stung Treng" },
  { label: "ស្វាយរៀង (Svay Rieng)", value: "Svay Rieng" },
  { label: "តាកែវ (Takeo)", value: "Takeo" },
  { label: "ត្បូងឃ្មុំ (Tbong Khmum)", value: "Tbong Khmum" },
];

export default function CitySelect({ value, onChange }) {
  const handleChange = (selectedOption) => {
    onChange(selectedOption ? selectedOption.value : "");
  };

  return (
    <Select
      options={cities}
      value={cities.find((c) => c.value === value) || null}
      onChange={handleChange}
      placeholder="-- ជ្រើសរើសទីក្រុង / Select City --"
      isClearable
      noOptionsMessage={() => "មិនមានក្នុងបញ្ជី / Not in list"}
    />
  );
}