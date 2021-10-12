import * as React from "react";
import { createStyles, makeStyles, withStyles, Theme } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import { ListItem as ListItemType } from "../../shared/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inline: {
      display: "inline"
    },
    avatar: {
      margin: 10,
      width: 80,
      height: 80
    },
    content: {
      paddingRight: theme.spacing(3)
    }
  })
);

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9"
  }
}))(Tooltip);

export default function PropertyListItem(
  props: ListItemType & {
    onSeen?: (hashId: string) => void;
    onAddToFavourites?: (hashId: string) => void;
  }
) {
  const classes = useStyles(undefined);
  const {
    name,
    img,
    price,
    seen,
    isInFavourites = false,
    hashId,
    onSeen,
    onAddToFavourites,
    link
  } = props;

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { checked, name }
    } = event;
    switch (name) {
      case "seen":
        onSeen(hashId);
        break;
      case "favourites":
        onAddToFavourites(hashId);
        break;
    }
  };

  const handleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    chrome.tabs.create({
      url: link,
      active: false
    });
    if (!seen) {
      onSeen(hashId);
    }
  };

  return (
    <ListItem
      alignItems="center"
      dense
      button
      component="button"
      onMouseDown={handleClick}
    >
      <ListItemAvatar>
        <HtmlTooltip
          title={
            <img src={img} style={{ maxHeight: "60vh", height: "60vh" }} />
          }
          enterDelay={500}
          leaveDelay={200}
        >
          <Avatar alt={name} src={img} className={classes.avatar} />
        </HtmlTooltip>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        className={classes.content}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              {price}
            </Typography>
          </React.Fragment>
        }
      />
      <ListItemSecondaryAction>
        {onSeen != null && (
          <Checkbox
            edge="end"
            onChange={handleToggle}
            name="seen"
            checked={seen}
          />
        )}
        {onAddToFavourites != null && (
          <Checkbox
            edge="end"
            onChange={handleToggle}
            icon={<i className="material-icons">favorite_border</i>}
            checkedIcon={<i className="material-icons">favorite</i>}
            name="favourites"
            checked={isInFavourites}
          />
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
}
