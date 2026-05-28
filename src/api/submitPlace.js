export async function submitPlace(data, isSystemAdmin = false) {
  const payload = {
    ...data,
    isSystemAdmin,
    action: "save"
  };
  const res = await fetch("https://script.google.com/macros/s/AKfycbwm6pRGrvuYIVHPvNho3HRd6oa9fHbgeyQFqAHM4WSg7NKdqYCRKphl5Sju707JM7mHWw/exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });
  return res.text();
}
