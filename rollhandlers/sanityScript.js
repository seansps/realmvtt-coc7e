// Apply sanity change
// Positive value = sanity loss, negative value = sanity gain
var san = parseInt(record.data?.san || "0", 10);
const maxSan = parseInt(record.data?.maxSan || "99", 10);

san -= value;
if (san < 0) san = 0;
if (san > maxSan) san = maxSan;

api.setValues({ "data.san": san });

const token = api.getToken();
if (token) {
  if (value > 0) {
    // Sanity loss — red
    api.floatText(token, `-${value}`, "#FF0000");
  } else if (value < 0) {
    // Sanity gain — blue
    api.floatText(token, `+${Math.abs(value)}`, "#4da6ff");
  }
}
