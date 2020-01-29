let workaroundForIE11: boolean;

try {
  document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
  workaroundForIE11 = false;
} catch (error) {
  workaroundForIE11 = true;
}

export function createTreeWalker(
  root: Element,
  whatToShow: number,
  filter: NodeFilter,
  entityReferenceExpansion?: boolean
): TreeWalker {
  let ownerDocument = root.ownerDocument;
  if (!ownerDocument) {
    throw new Error('Element must be in the DOM');
  }

  // IE11 uses a different syntax, and expects just a function, not the `NodeFilter` object.
  if (workaroundForIE11) {
    let acceptNode = filter ? ((filter.acceptNode as any) as NodeFilter) : null;
    return ownerDocument.createTreeWalker(root, whatToShow, acceptNode, entityReferenceExpansion);
  } else {
    return ownerDocument.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion);
  }
}
