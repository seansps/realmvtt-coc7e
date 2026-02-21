// Apply healing to a Call of Cthulhu 7e token
if (value > 0) {
  const maxHp = parseInt(record.data?.maxHp, 10) || 1;
  var curHp = parseInt(record.data?.curHp, 10) || 0;
  curHp = Math.min(maxHp, curHp + value);

  api.setValue("data.curHp", curHp);
}

// Float healing text
const token = api.getToken();
if (value > 0 && token) {
  api.floatText(token, `+${value}`, "#1bc91b");
}
