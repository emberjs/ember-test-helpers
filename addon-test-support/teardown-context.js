import { run } from '@ember/runloop';

export default function(context) {
  let { owner } = context;

  run(owner, 'destroy');
}
