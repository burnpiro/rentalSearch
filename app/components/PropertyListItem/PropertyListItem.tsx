import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
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

  return (
    <ListItem
      alignItems="center"
      dense
      button
      component="a"
      href={link}
      target="_blank"
    >
      <ListItemAvatar>
        <Avatar alt={name} src={img} className={classes.avatar} />
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
