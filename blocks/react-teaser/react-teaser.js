export default async function decorate(block) {
  const { mount } = await import('../../scripts/react-islands.js');
  mount(block);
}
