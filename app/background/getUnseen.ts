export default function getUnseen(list) {
  return list.reduce((acc, element) => {
    if(!element.seen) {
      acc += 1;
    }
    return acc;
  }, 0);
}