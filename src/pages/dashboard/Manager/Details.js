import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import "../../../assets/css/detailTicket.css";
import { ArrowBack, Cached, CreditScore } from "@mui/icons-material";
import UploadComponent from "../../helpers/UploadComponent";
import PropTypes from "prop-types";
import "../../../assets/css/homeManager.css";
import {
  getImpactById,
  getPriorityOption,
  getUrgencyById,
  ticketStatus,
} from "../../helpers/tableComlumn";
import { formatDate } from "../../helpers/FormatDate";
import EditTicketModel from "./EditTicketModel";
import { UpdateTicketForTechnician } from "../../../app/api/ticket";
import { useSelector } from "react-redux";

const Details = ({ data, loading, dataCategories, dataMode }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const user = useSelector((state) => state.auth);
  const userRole = user.user.role;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const reloadData = () => {
    try {
      UpdateTicketForTechnician(data);
    } catch (error) {
      console.error("Error while reloading data", error);
    }
  };

  const handleImageDialogOpen = () => {
    setOpenImageDialog(true);
  };

  const handleImageDialogClose = () => {
    setOpenImageDialog(false);
  };

  Details.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool.isRequired,
  };
  return (
    <div>
      <Grid container spacing={2} alignItems="center" className="gridContainer">
        <Grid item xs={12}>
          <div className="labelContainer">
            <Typography
              variant="subtitle1"
              color="textSecondary"
              className="descriptionLabel"             
            >
              Description
            </Typography>
            <ArrowBack className="icon" />
          </div>
          <TextField
            id="description"
            name="description"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={data?.description || ""}
            disabled
            InputProps={{
              style: { fontSize: '1.5em' }
            }}
          />
          <UploadComponent />
          <div className="buttonContainer">
            {data.attachmentUrl && (
              <Button
                variant="contained"
                className="button"
                onClick={handleImageDialogOpen}
              >
                See Image
              </Button>
            )}
          </div>
          <div className="labelContainer">
            <Typography
              variant="subtitle1"
              color="textSecondary"
              className="descriptionLabel"
            >
              <div
                className="descriptionLabel"
                style={{ cursor: "pointer", color: "blue" }}
                onClick={reloadData}
              >
                Properties <Cached /> <span>Reload</span>
              </div>{" "}
              {userRole === 3 && <CreditScore />}
              {userRole === 3 && (
                <span
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={handleEditClick}
                >
                  Edit
                </span>
              )}
            </Typography>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Requester</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {data.requester
                    ? `${data.requester.lastName} ${data.requester.firstName}`
                    : "Manager"}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Impact</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {getImpactById(data.impact)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Status</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {ticketStatus.find(
                    (status) => status.id === data.ticketStatus
                  )?.name || "Unknown Status"}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>
                  Impact Detail
                </TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {data.impactDetail || "Not Assigned"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Mode</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {data && data.mode && data.mode.description ? data.mode.description : "Mode N/A"}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Urgency</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {getUrgencyById(data.urgency)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Service</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {data && data.service && data.service.description ? data.service.description : "Service N/A"}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Priority</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {getPriorityOption(data.priority)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Assignment</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {data && data.assignment && data.assignment.technicianFullName ? data.assignment.technicianFullName : "Assignment N/A"}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Category</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {dataCategories.find(
                    (category) => category.id === data.categoryId
                  )?.name || "Unknown Priority"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>
                  Scheduled Start Time
                </TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.scheduledStartTime)}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>
                  Scheduled End Time
                </TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.scheduledEndTime)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>DueTime</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.dueTime)}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>
                  Completed Time
                </TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.completedTime)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>Created At</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.createdAt)}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold", color: "#007bff", paddingRight: "16px", backgroundColor: "#f2f2f2" }}>
                  Modified At
                </TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {formatDate(data.modifiedAt)}
                </TableCell>
              </TableRow>
              {isEditDialogOpen && (userRole === 2 || userRole === 3) && (
                <EditTicketModel
                  open={isEditDialogOpen}
                  onClose={() => setIsEditDialogOpen(false)}
                  ticketId={data.id} // Pass the ticketId to the EditTicketModel component
                  data={data} // Pass the data to the EditTicketModel component
                />
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
      <Dialog
        open={openImageDialog}
        onClose={handleImageDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image</DialogTitle>
        <DialogContent>
          <div
            style={{
              background: `url(${data.attachmentUrl})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "100%",
              height: "70vh", 
            }}
          ></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Details;
