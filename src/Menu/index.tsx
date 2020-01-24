/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import { AbstractTooltip } from "../AbstractTooltip";
import { TippyMenuStyles } from "./menu/TippyMenuStyles";
import {
  IconSize,
  MenuIconSizeProvider,
  useMenuIconSize,
} from "../MenuIconSize";
import { Instance, ReferenceElement } from "tippy.js";

interface Props extends React.ComponentProps<typeof AbstractTooltip> {
  // extends Pick<
  //   React.ComponentProps<typeof AbstractTooltip>,
  //   "content" | "children" | "trigger" | "maxWidth"
  // > {
  style?: React.CSSProperties;

  /**
   * Optionally set the icon size to use for all `MenuItem` descendents. This
   * value will automatically be passed down via context and can be overriden by
   * child `Menu` components
   *
   * Is inherited by antecedent definitions, or defaulted to `normal` if there
   * are none
   */
  iconSize?: IconSize;
}

function calculateMaxHeight(instance: Instance) {
  const parentHeight =
    instance.props.appendTo === "parent"
      ? (instance.reference as any).offsetParent.offsetHeight
      : document.body.clientHeight;

  const {
    height: referenceHeight,
    top: referenceTop,
  } = instance.reference.getBoundingClientRect();

  const {
    height: arrowHeight,
  } = instance.popperChildren.arrow?.getBoundingClientRect() ?? { height: 0 };

  const { distance } = instance.props;

  return (
    parentHeight -
    referenceTop -
    referenceHeight -
    arrowHeight -
    parseFloat(getComputedStyle(instance.popperChildren.tooltip).paddingTop) -
    parseFloat(
      getComputedStyle(instance.popperChildren.tooltip).paddingBottom
    ) -
    (typeof distance === "number" ? distance : 0) -
    // Margin from bottom of the page
    5
  );
}

function isReferenceObject(reference: any): reference is ReferenceElement {
  return typeof (reference as ReferenceElement)._tippy !== "undefined";
}

export const Menu: React.FC<Props> = ({ children, iconSize, ...props }) => {
  const inheritedIconSize = useMenuIconSize();

  return (
    <MenuIconSizeProvider iconSize={iconSize ?? inheritedIconSize}>
      <TippyMenuStyles />
      <AbstractTooltip
        hideOnClick
        theme="space-kit-menu"
        appendTo="parent"
        trigger="mouseenter"
        popperOptions={{
          modifiers: {
            preventOverflow: {
              boundariesElement: "window",
            },
            setMaxHeight: {
              enabled: true,
              order: 0,
              fn: data => {
                const reference = data.instance.reference;
                if (isReferenceObject(reference) && reference._tippy) {
                  const tippy = reference._tippy;
                  const calculatedMaxHeight = calculateMaxHeight(tippy);
                  tippy.popperChildren.content.style.maxHeight = `${calculatedMaxHeight}px`;
                }
                return data;
              },
            },
          },
        }}
        {...props}
        interactive
      >
        {children}
      </AbstractTooltip>
    </MenuIconSizeProvider>
  );
};
