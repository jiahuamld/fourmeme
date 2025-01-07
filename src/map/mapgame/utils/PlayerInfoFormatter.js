export const playerFieldDisplayNames = {
};

export const buildingFieldDisplayNames = {
};

export const escapeHTML = (str) => {
  if (typeof str !== 'string') {
      return str;
  }
  return str.replace(/[&<>"']/g, function(match) {
      const escapeChars = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
      };
      return escapeChars[match];
  });
};

export const generateDynamicHTML = (data, fieldDisplayNames = {}, indentLevel = 0) => {
  let html = '';

  if (Array.isArray(data)) {
      html += `<ul>`;
      data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
              html += `<li>${generateDynamicHTML(item, fieldDisplayNames, indentLevel + 1)}</li>`;
          } else {
              const formattedValue = typeof item === 'number' ? item.toFixed(2) : item;
              html += `<li>${escapeHTML(String(formattedValue))}</li>`;
          }
      });
      html += `</ul>`;
  } 
  else if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
          const displayKey = key;
          let displayValue = value;

          if (typeof value === 'number') {
              if (key === 'balance' || key === 'totalDailyRent' || key === 'rent' || key === 'value') {
                  displayValue = `$${value.toFixed(2)}`;
              } else {
                  displayValue = value.toFixed(2);
              }
          }
          else if (key === 'happiness' && typeof value === 'number') {
              displayValue = `${value.toFixed(2)}%`;
          }
          else if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
          }

          if (typeof value === 'object' && value !== null) {
              html += `
                  <details open>
                      <summary><strong>${escapeHTML(displayKey)}:</strong></summary>
                      ${generateDynamicHTML(value, fieldDisplayNames, indentLevel + 1)}
                  </details>
              `;
          } else {
              html += `<p><strong>${escapeHTML(displayKey)}:</strong> ${escapeHTML(String(displayValue))}</p>`;
          }
      }
  } 
  else {
      const formattedValue = typeof data === 'number' ? data.toFixed(2) : data;
      html += `<p>${escapeHTML(String(formattedValue))}</p>`;
  }

  return html;
};


