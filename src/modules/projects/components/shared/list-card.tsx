import * as React from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

interface ListCardProps {
  avatar: React.ReactNode;
  primary: React.ReactNode;
  secondary: React.ReactNode;
  badge: React.ReactNode;
  actions: React.ReactNode;
}

/**
 * Project-wide row used by Members, Invitations, etc. Built on top of shadcn's
 * `Item` primitive so spacing, borders and focus rings stay consistent across
 * project management screens. The public API is unchanged for existing callers.
 */
export function ListCard({ avatar, primary, secondary, badge, actions }: ListCardProps) {
  return (
    <Item
      variant="outline"
      size="sm"
      className="bg-card hover:bg-muted/40 transition-colors"
    >
      <ItemMedia>{avatar}</ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="truncate">{primary}</ItemTitle>
        {secondary ? (
          <div
            className={cn(
              "text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance",
              "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
              "text-xs text-muted-foreground",
            )}
          >
            {secondary}
          </div>
        ) : null}
      </ItemContent>
      <ItemActions className="min-w-0 flex-wrap justify-end gap-1.5">
        {badge}
        {actions}
      </ItemActions>
    </Item>
  );
}
