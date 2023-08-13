const icons = {
  sources: {
    wasapi_input_capture: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27%23d2d2d2%27%3E%3Cpath%20d%3D%27M3.91-.03a1%201%200%200%200-.13.03A1%201%200%200%200%203%201v2a1%201%200%201%200%202%200V1A1%201%200%200%200%203.91-.03zM1.35%202a.5.5%200%200%200-.34.5V3c0%201.48%201.09%202.69%202.5%202.94V7h-.5c-.55%200-1%20.45-1%201h4.01c0-.55-.45-1-1-1h-.5V5.94C5.93%205.7%207.02%204.48%207.02%203v-.5a.5.5%200%201%200-1%200V3c0%201.11-.89%202-2%202-1.11%200-2-.89-2-2v-.5a.5.5%200%200%200-.59-.5.5.5%200%200%200-.06%200z%27%2F%3E%3C%2Fsvg%3E`,
    wasapi_output_capture: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%23d2d2d2%27%20stroke%3D%27%23d2d2d2%27%20d%3D%27M11%205%206%209H2v6h4l5%204z%27%2F%3E%3Cpath%20stroke%3D%27%23d2d2d2%27%20d%3D%27M19.07%204.93a10%2010%200%200%201%200%2014.14M15.54%208.46a5%205%200%200%201%200%207.07%27%2F%3E%3C%2Fsvg%3E`,
    browser_source: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%2014%2016%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M7%201C3.14%201%200%204.14%200%208s3.14%207%207%207c.48%200%20.94-.05%201.38-.14-.17-.08-.2-.73-.02-1.09.19-.41.81-1.45.2-1.8-.61-.35-.44-.5-.81-.91-.37-.41-.22-.47-.25-.58-.08-.34.36-.89.39-.94.02-.06.02-.27%200-.33%200-.08-.27-.22-.34-.23-.06%200-.11.11-.2.13-.09.02-.5-.25-.59-.33-.09-.08-.14-.23-.27-.34-.13-.13-.14-.03-.33-.11s-.8-.31-1.28-.48c-.48-.19-.52-.47-.52-.66-.02-.2-.3-.47-.42-.67-.14-.2-.16-.47-.2-.41-.04.06.25.78.2.81-.05.02-.16-.2-.3-.38-.14-.19.14-.09-.3-.95s.14-1.3.17-1.75c.03-.45.38.17.19-.13-.19-.3%200-.89-.14-1.11-.13-.22-.88.25-.88.25.02-.22.69-.58%201.16-.92.47-.34.78-.06%201.16.05.39.13.41.09.28-.05-.13-.13.06-.17.36-.13.28.05.38.41.83.36.47-.03.05.09.11.22s-.06.11-.38.3c-.3.2.02.22.55.61s.38-.25.31-.55c-.07-.3.39-.06.39-.06.33.22.27.02.5.08.23.06.91.64.91.64-.83.44-.31.48-.17.59.14.11-.28.3-.28.3-.17-.17-.19.02-.3.08-.11.06-.02.22-.02.22-.56.09-.44.69-.42.83%200%20.14-.38.36-.47.58-.09.2.25.64.06.66-.19.03-.34-.66-1.31-.41-.3.08-.94.41-.59%201.08.36.69.92-.19%201.11-.09.19.1-.06.53-.02.55.04.02.53.02.56.61.03.59.77.53.92.55.17%200%20.7-.44.77-.45.06-.03.38-.28%201.03.09.66.36.98.31%201.2.47.22.16.08.47.28.58.2.11%201.06-.03%201.28.31.22.34-.88%202.09-1.22%202.28-.34.19-.48.64-.84.92s-.81.64-1.27.91c-.41.23-.47.66-.66.8%203.14-.7%205.48-3.5%205.48-6.84%200-3.86-3.14-7-7-7L7%201zm1.64%206.56c-.09.03-.28.22-.78-.08-.48-.3-.81-.23-.86-.28%200%200-.05-.11.17-.14.44-.05.98.41%201.11.41.13%200%20.19-.13.41-.05.22.08.05.13-.05.14zM6.34%201.7c-.05-.03.03-.08.09-.14.03-.03.02-.11.05-.14.11-.11.61-.25.52.03-.11.27-.58.3-.66.25zm1.23.89c-.19-.02-.58-.05-.52-.14.3-.28-.09-.38-.34-.38-.25-.02-.34-.16-.22-.19.12-.03.61.02.7.08.08.06.52.25.55.38.02.13%200%20.25-.17.25zm1.47-.05c-.14.09-.83-.41-.95-.52-.56-.48-.89-.31-1-.41-.11-.1-.08-.19.11-.34.19-.15.69.06%201%20.09.3.03.66.27.66.55.02.25.33.5.19.63h-.01z%27%2F%3E%3C%2Fsvg%3E`,
    color_source_v3: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M7.44.03c-.03%200-.04.02-.06.03L3.63%202.72c-.04.03-.1.11-.13.16l-.13.25c.72.23%201.27.78%201.5%201.5l.25-.13c.05-.03.12-.08.16-.13L7.94.62c.03-.05.04-.09%200-.13L7.5.05C7.48.03%207.46.02%207.44.02zM2.66%204c-.74%200-1.31.61-1.31%201.34%200%20.99-.55%201.85-1.34%202.31.39.22.86.34%201.34.34%201.47%200%202.66-1.18%202.66-2.66%200-.74-.61-1.34-1.34-1.34z%27%2F%3E%3C%2Fsvg%3E`,
    monitor_capture: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20fill%3D%27%23d2d2d2%27%20fill-rule%3D%27evenodd%27%20d%3D%27M15%202H1c-.55%200-1%20.45-1%201v9c0%20.55.45%201%201%201h5.34c-.25.61-.86%201.39-2.34%202h8c-1.48-.61-2.09-1.39-2.34-2H15c.55%200%201-.45%201-1V3c0-.55-.45-1-1-1zm0%209H1V3h14v8z%27%2F%3E%3C%2Fsvg%3E`,
    game_capture: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%20640%20512%27%3E%3Cpath%20d%3D%27M480%2096H160C71.6%2096%200%20167.6%200%20256s71.6%20160%20160%20160c44.8%200%2085.2-18.4%20114.2-48h91.5c29%2029.6%2069.5%2048%20114.2%2048%2088.4%200%20160-71.6%20160-160S568.4%2096%20480%2096zM256%20276c0%206.6-5.4%2012-12%2012h-52v52c0%206.6-5.4%2012-12%2012h-40c-6.6%200-12-5.4-12-12v-52H76c-6.6%200-12-5.4-12-12v-40c0-6.6%205.4-12%2012-12h52v-52c0-6.6%205.4-12%2012-12h40c6.6%200%2012%205.4%2012%2012v52h52c6.6%200%2012%205.4%2012%2012v40zm184%2068c-26.5%200-48-21.5-48-48s21.5-48%2048-48%2048%2021.5%2048%2048-21.5%2048-48%2048zm80-80c-26.5%200-48-21.5-48-48s21.5-48%2048-48%2048%2021.5%2048%2048-21.5%2048-48%2048z%27%2F%3E%3C%2Fsvg%3E`,
    image_source: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M0%200v8h8V0H0zm1%201h6v3L6%203%205%204l2%202v1H6L2%203%201%204V1z%27%2F%3E%3C%2Fsvg%3E`,
    slideshow: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20fill%3D%27%23d2d2d2%27%20d%3D%27M7.351.649H8v4.594h-.649zM2.595%200H8v.649H2.595zm3.891%201.514h.65v4.594h-.65zM1.73.864h5.405v.65H1.73zm3.892%201.514h.648v4.595h-.648zM.865%201.73H6.27v.648H.865zM0%202.595V8h5.405V2.595zm.676.675H4.73v2.027l-.676-.675-.676.675L4.73%206.65v.675h-.676L1.351%204.622l-.675.675z%27%2F%3E%3C%2Fsvg%3E`,
    ffmpeg_source: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M1%201v6l6-3-6-3z%27%2F%3E%3C%2Fsvg%3E`,
    ndi_source: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27M13%202H6a2%202%200%200%200-2%202v16a2%202%200%200%200%202%202h12a2%202%200%200%200%202-2V9z%27%2F%3E%3Cpath%20d%3D%27M13%202v7h7%27%2F%3E%3C%2Fsvg%3E`,
    scene: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M.5%200C.22%200%200%20.22%200%20.5s.22.5.5.5.5-.22.5-.5S.78%200%20.5%200zM2%200v1h6V0H2zM.5%202c-.28%200-.5.22-.5.5s.22.5.5.5.5-.22.5-.5S.78%202%20.5%202zM2%202v1h6V2H2zM.5%204c-.28%200-.5.22-.5.5s.22.5.5.5.5-.22.5-.5S.78%204%20.5%204zM2%204v1h6V4H2zM.5%206c-.28%200-.5.22-.5.5s.22.5.5.5.5-.22.5-.5S.78%206%20.5%206zM2%206v1h6V6H2z%27%2F%3E%3C%2Fsvg%3E`,
    text_gdiplus_v2: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M0%200v2h.5c0-.55.45-1%201-1H3v5.5c0%20.28-.22.5-.5.5H2v1h4V7h-.5c-.28%200-.5-.22-.5-.5V1h1.5c.55%200%201%20.45%201%201H8V0H0z%27%2F%3E%3C%2Fsvg%3E`,
    dshow_input: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M15%203H7c0-.55-.45-1-1-1H2c-.55%200-1%20.45-1%201-.55%200-1%20.45-1%201v9c0%20.55.45%201%201%201h14c.55%200%201-.45%201-1V4c0-.55-.45-1-1-1zM6%205H2V4h4v1zm4.5%207C8.56%2012%207%2010.44%207%208.5S8.56%205%2010.5%205%2014%206.56%2014%208.5%2012.44%2012%2010.5%2012zM13%208.5c0%201.38-1.13%202.5-2.5%202.5S8%209.87%208%208.5%209.13%206%2010.5%206%2013%207.13%2013%208.5z%27%2F%3E%3C%2Fsvg%3E`,
    av_capture_input_v2: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M15%203H7c0-.55-.45-1-1-1H2c-.55%200-1%20.45-1%201-.55%200-1%20.45-1%201v9c0%20.55.45%201%201%201h14c.55%200%201-.45%201-1V4c0-.55-.45-1-1-1zM6%205H2V4h4v1zm4.5%207C8.56%2012%207%2010.44%207%208.5S8.56%205%2010.5%205%2014%206.56%2014%208.5%2012.44%2012%2010.5%2012zM13%208.5c0%201.38-1.13%202.5-2.5%202.5S8%209.87%208%208.5%209.13%206%2010.5%206%2013%207.13%2013%208.5z%27%2F%3E%3C%2Fsvg%3E`,
    'decklink-input': `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M15%203H7c0-.55-.45-1-1-1H2c-.55%200-1%20.45-1%201-.55%200-1%20.45-1%201v9c0%20.55.45%201%201%201h14c.55%200%201-.45%201-1V4c0-.55-.45-1-1-1zM6%205H2V4h4v1zm4.5%207C8.56%2012%207%2010.44%207%208.5S8.56%205%2010.5%205%2014%206.56%2014%208.5%2012.44%2012%2010.5%2012zM13%208.5c0%201.38-1.13%202.5-2.5%202.5S8%209.87%208%208.5%209.13%206%2010.5%206%2013%207.13%2013%208.5z%27%2F%3E%3C%2Fsvg%3E`,
    window_capture: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%2014%2016%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M5%203h1v1H5V3zM3%203h1v1H3V3zM1%203h1v1H1V3zm12%2010H1V5h12v8zm0-9H7V3h6v1zm1-1c0-.55-.45-1-1-1H1c-.55%200-1%20.45-1%201v10c0%20.55.45%201%201%201h12c.55%200%201-.45%201-1V3z%27%2F%3E%3C%2Fsvg%3E`,
    group: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M0%200v2h8V1H3V0H0zm0%203v4.5c0%20.28.22.5.5.5h7c.28%200%20.5-.22.5-.5V3H0z%27%2F%3E%3C%2Fsvg%3E`,
    text_ft2_source_v2: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3Cpath%20d%3D%27M0%200v2h.5c0-.55.45-1%201-1H3v5.5c0%20.28-.22.5-.5.5H2v1h4V7h-.5c-.28%200-.5-.22-.5-.5V1h1.5c.55%200%201%20.45%201%201H8V0H0z%27%2F%3E%3C%2Fsvg%3E`,
  },
  defaultSource: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27M13%202H6a2%202%200%200%200-2%202v16a2%202%200%200%200%202%202h12a2%202%200%200%200%202-2V9z%27%2F%3E%3Cpath%20d%3D%27M13%202v7h7%27%2F%3E%3C%2Fsvg%3E`,
  trash: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27M3%206h18m-2%200v14a2%202%200%200%201-2%202H7a2%202%200%200%201-2-2V6m3%200V4a2%202%200%200%201%202-2h4a2%202%200%200%201%202%202v2m-6%205v6m4-6v6%27%2F%3E%3C%2Fsvg%3E`,
  crop: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cg%20fill%3D%27%23d2d2d2%27%3E%3Cpath%20d%3D%27M14%2012a1%201%200%200%201%201%201%201%201%200%200%201-1%201M1.998%203a1%201%200%201%200%200%202H11v9a1%201%200%200%200%202%20.002V4.055A1%201%200%200%200%2012.002%203S4.788%202.996%201.998%203z%27%2F%3E%3Cpath%20d%3D%27M2%206v7a1%201%200%200%200%20.998%201H10v-2H4V6Zm0-4a1%201%200%200%201%201-1%201%201%200%200%201%201%201%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E`,
  revert: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27M1%204v6h6%27%2F%3E%3Cpath%20d%3D%27M3.51%2015a9%209%200%201%200%202.13-9.36L1%2010%27%2F%3E%3C%2Fsvg%3E`,
  check: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%276%27%20viewBox%3D%270%200%2032%2032%27%3E%3Cpath%20d%3D%27m4%2020%208%208M28%204%2012%2028%27%2F%3E%3C%2Fsvg%3E`,
  zoomOut: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m22%2022-9.05-9.05a7%207%200%201%201-9.9-9.9%207%207%200%201%201%209.9%209.9M6%208h4%27%2F%3E%3C%2Fsvg%3E`,
  zoomIn: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m22%2022-9.05-9.05a7%207%200%201%201-9.9-9.9%207%207%200%201%201%209.9%209.9M6%208h4M8%206v4%27%2F%3E%3C%2Fsvg%3E`,
  plus: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20stroke-width%3D%272.447%27%20d%3D%27M12%201.519v20.962M1.519%2012h20.962%27%2F%3E%3C%2Fsvg%3E`,
  up: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%20transform%3D%27matrix(-1.7072%200%200%20-1.7538%2032.454%2033.055)%27%2F%3E%3C%2Fsvg%3E`,
  down: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%20transform%3D%27matrix(1.7072%200%200%201.7538%20-8.519%20-9.037)%27%2F%3E%3C%2Fsvg%3E`,
  left: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%20transform%3D%27matrix(0%20-1.7072%20-1.7538%200%2032.495%2032.495)%27%2F%3E%3C%2Fsvg%3E`,
  right: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20stroke%3D%27%23d2d2d2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%20transform%3D%27matrix(0%201.7072%201.7538%200%20-8.519%20-8.48)%27%2F%3E%3C%2Fsvg%3E`,
  addRow: `data:image/svg+xml,%3Csvg%20fill%3D%27none%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cdefs%3E%3Cmask%20id%3D%27a%27%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27%23fff%27%2F%3E%3Ccircle%20r%3D%278%27%20cx%3D%2712%27%20cy%3D%2716%27%20fill%3D%27%23000%27%2F%3E%3C%2Fmask%3E%3Cmask%20id%3D%27b%27%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27%23fff%27%2F%3E%3Cpath%20d%3D%27M9%2016h6m-3%203v-6%27%20stroke%3D%27%23000%27%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Cpath%20d%3D%27M1%202v12h22V2Z%27%20stroke%3D%27%23d2d2d2%27%20mask%3D%27url%28%23a%29%27%2F%3E%3Ccircle%20r%3D%276%27%20cx%3D%2712%27%20cy%3D%2716%27%20fill%3D%27%23d2d2d2%27%20mask%3D%27url%28%23b%29%27%2F%3E%3C%2Fsvg%3E`,
  removeRow:
    'data:image/svg+xml,%3Csvg%20fill%3D%27none%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%272%27%20viewBox%3D%270%200%2024%2024%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cdefs%3E%3Cmask%20id%3D%27a%27%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27%23fff%27%2F%3E%3Ccircle%20r%3D%278%27%20cx%3D%2712%27%20cy%3D%2716%27%20fill%3D%27%23000%27%2F%3E%3C%2Fmask%3E%3Cmask%20id%3D%27b%27%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27%23fff%27%2F%3E%3Cpath%20d%3D%27M9%2016h6%27%20stroke%3D%27%23000%27%2F%3E%3C%2Fmask%3E%3C%2Fdefs%3E%3Cpath%20d%3D%27M1%202v12h22V2Z%27%20stroke%3D%27%23d2d2d2%27%20mask%3D%27url%28%23a%29%27%2F%3E%3Ccircle%20r%3D%276%27%20cx%3D%2712%27%20cy%3D%2716%27%20fill%3D%27%23d2d2d2%27%20mask%3D%27url%28%23b%29%27%2F%3E%3C%2Fsvg%3E',
  blank: `data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3C%2Fsvg%3E`,
  eyeDropper:
    'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2060%2060%22%20fill%3D%22%23d2d2d2%22%3E%3Cpath%20d%3D%22M8.2%2049.8a1%201%200%200%200-1.4%200l-2.5%202.5a4.5%204.5%200%200%200%200%206.4%204.5%204.5%200%200%200%206.4%200%204.5%204.5%200%200%200%200-6.4l-2.5-2.5zM55.2%2010.4a6.2%206.2%200%200%200%20.5-8.2%206%206%200%200%200-8.9-.4l-3.5%203.5a3%203%200%200%201-4.2%200l-.6-.6c-.8-.8-2.2-.8-3%200l-4%204a2.2%202.2%200%200%200%200%203l2%202L18.1%2029l-1%201a13.6%2013.6%200%200%200-3.4%205.7l-1%202.4-.2.2a11.9%2011.9%200%200%201-1.7%202.2l-4.4%204.4%205.7%205.6%204.3-4.3c1.4-1.4%203-2.4%205-3A13.5%2013.5%200%200%200%2027%2040L38%2029l5.3-5.4%202%202a2.2%202.2%200%200%200%203.1%200l4-4c.8-.8.8-2.2%200-3l-.6-.7a3%203%200%200%201%200-4.1l3.4-3.4zM35.2%2029H21L35%2015.1l7%207.1-6.7%206.8z%22%2F%3E%3C%2Fsvg%3E',
};

export { icons };


//`data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27%23d2d2d2%27%20viewBox%3D%270%200%208%208%27%3E%3C%2Fsvg%3E`,
//'data:image/svg+xml,%3Csvg+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22+xml%3Aspace%3D%22preserve%22+viewBox%3D%220+0+60+60%22%3E%3Cpath+d%3D%22M8.2+49.8a1+1+0+0+0-1.4+0l-2.5+2.5a4.5+4.5+0+0+0+0+6.4+4.5+4.5+0+0+0+6.4+0+4.5+4.5+0+0+0+0-6.4l-2.5-2.5zM55.2+10.4a6.2+6.2+0+0+0+.5-8.2+6+6+0+0+0-8.9-.4l-3.5+3.5a3+3+0+0+1-4.2+0l-.6-.6c-.8-.8-2.2-.8-3+0l-4+4a2.2+2.2+0+0+0+0+3l2+2L18.1+29l-1+1a13.6+13.6+0+0+0-3.4+5.7l-1+2.4-.2.2a11.9+11.9+0+0+1-1.7+2.2l-4.4+4.4+5.7+5.6+4.3-4.3c1.4-1.4+3-2.4+5-3A13.5+13.5+0+0+0+27+40L38+29l5.3-5.4+2+2a2.2+2.2+0+0+0+3.1+0l4-4c.8-.8.8-2.2+0-3l-.6-.7a3+3+0+0+1+0-4.1l3.4-3.4zM35.2+29H21L35+15.1l7+7.1-6.7+6.8z%22%2F%3E%3C%2Fsvg%3E',