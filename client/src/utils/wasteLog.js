export function invalidateWasteQueries(queryClient) {
  [
    ['waste-recent'],
    ['recent-logs'],
    ['overview'],
    ['waste-trend'],
    ['meal-breakdown'],
    ['ai-insights'],
    ['menu-correlation'],
  ].forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey })
  })
}
