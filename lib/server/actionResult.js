export function actionSuccess(data = null) {
  return { ok: true, data }
}

export function actionError(error) {
  return { ok: false, error }
}
