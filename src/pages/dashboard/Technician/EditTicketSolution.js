import React, { useState } from "react";
import "../../../assets/css/ticketSolution.css";
import { Grid, Switch, TextField } from "@mui/material";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  editTicketSolution,
  getTicketSolutionById,
} from "../../../app/api/ticketSolution";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment";
import { getDataCategories } from "../../../app/api/category";
import { toast } from "react-toastify";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import DateValidation from "../../helpers/DateValidation";

const EditTicketSolution = () => {
  const navigate = useNavigate();
  const { solutionId } = useParams();
  const [dataCategories, setDataCategories] = useState([]);
  const [data, setData] = useState({
    id: 1,
    title: "",
    content: "",
    categoryId: 1,
    ownerId: 1,
    reviewDate: "",
    expiredDate: "",
    keyword: "",
    internalComments: "",
    attachmentUrl: "",
    isApproved: false,
    isPublic: true,
    createdAt: "",
    modifiedAt: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [reviewDate, setReviewDate] = useState(moment());
  const [expiredDate, setExpiredDate] = useState(moment());

  const handleReviewDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setReviewDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      reviewDate: formattedDate,
    }));
  };

  const handleExpiredDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setExpiredDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      expiredDate: formattedDate,
    }));
  };

  const handlePublicToggle = () => {
    setData((prevData) => ({
      ...prevData,
      isPublic: !prevData.isPublic,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const fetchDataSolution = async () => {
    try {
      const fetchCategories = await getDataCategories();
      setDataCategories(fetchCategories);
    } catch (error) {
      console.log("Error while fetching data", error);
    } finally {
    }
  };

  useEffect(() => {
    const fetchSolutionData = async () => {
      try {
        const solutionData = await getTicketSolutionById(solutionId);
        setData((prevData) => ({
          ...prevData,
          id: solutionData.id,
          title: solutionData.title,
          content: solutionData.content,
          categoryId: solutionData.categoryId,
          ownerId: solutionData.ownerId,
          reviewDate: solutionData.reviewDate,
          expiredDate: solutionData.expiredDate,
          keyword: solutionData.keyword,
          internalComments: solutionData.internalComments,
          attachmentUrl: solutionData.attachmentUrl,
          isApproved: solutionData.isApproved,
          isPublic: solutionData.isPublic,
          createdAt: solutionData.createdAt,
          modifiedAt: solutionData.modifiedAt,
        }));
      } catch (error) {
        console.log("Error while fetching solution data", error);
      }
    };
    fetchSolutionData();
    fetchDataSolution();
  }, [solutionId]);

  const validateDate = (reviewDate, expiredDate) => {
    if (!reviewDate || !expiredDate) {
      return false; // If either date is missing, return false
    }
    return moment(reviewDate).isBefore(expiredDate);
  };

  const handleEditSolutionTicket = async (e) => {
    e.preventDefault();
    let attachmentUrl = data.attachmentUrl;
    if (selectedFile) {
      const storage = getStorage();
      const storageRef = ref(storage, "images/" + selectedFile.name);
      await uploadBytes(storageRef, selectedFile);
      attachmentUrl = await getDownloadURL(storageRef);
    }
    const isDataValid = validateDate(data.reviewDate, data.expiredDate);
    if (!isDataValid) {
      toast.info("Review Date must be earlier than Expired Date.");
      return;
    }
  
    const formattedReviewDate = moment(data.reviewDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    );
    const formattedExpiredDate = moment(data.expiredDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    );

    const updatedData = {
      ...data,
      attachmentUrl: attachmentUrl,
      reviewDate: formattedReviewDate,
      expiredDate: formattedExpiredDate,
    };
    setData(updatedData);
    try {
      const res = await editTicketSolution(solutionId, data);
      console.log(res);
      toast.success("Ticket Solution edit successful");
    } catch (error) {
      console.error(error);
      toast.error("Error editing ticket solution");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setData((prevData) => ({
      ...prevData,
      [name]: value || "",
    }));
  };

  const handleGoBack = () => {
    navigate(`/home/detailSolution/${solutionId}`);
  };

  return (
    <Grid
      container
      style={{
        border: "1px solid #ccc",
        paddingRight: "10px",
        paddingLeft: "10px",
      }}
    >
      <Grid item xs={12}>
        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="5" className="mt-2">
              <div className="d-flex align-items-center">
                <button type="button" className="btn btn-link icon-label">
                  <ArrowBack
                    onClick={handleGoBack}
                    className="arrow-back-icon"
                  />
                </button>

                <h2 style={{ marginLeft: "10px" }}>Edit Solution</h2>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
        <MDBRow className="mb-4">
          <MDBCol
            md="12"
            className="mt-4"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Grid container justifyContent="flex-end">
              {" "}
              {/* Set justifyContent to 'flex-end' */}
              <Grid item xs={3}>
                <h2 className="align-right">
                  <span style={{ color: "red" }}>*</span>Title
                </h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  id="title"
                  type="text"
                  name="title"
                  className="form-control input-field"
                  value={data.title}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">
                  <span style={{ color: "red" }}>*</span>Content
                </h2>
              </Grid>
              <Grid item xs={9}>
                <textarea
                  type="content"
                  id="content"
                  name="content"
                  className="form-control input-field-2"
                  rows="6"
                  value={data.content}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">Attachment</h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  type="file"
                  name="attachmentUrl"
                  className="form-control input-field"
                  id="attachmentUrl"
                  onChange={handleFileChange}
                />
                <div style={{ marginBottom: "10px" }}>
                  {data.attachmentUrl
                    ? data.attachmentUrl.name
                    : "No file selected"}
                </div>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">
                        <span style={{ color: "red" }}>*</span>Category
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="categoryId"
                        name="categoryId"
                        className="form-select"
                        value={data.categoryId}
                        onChange={handleInputChange}
                      >
                        {dataCategories
                          .filter((category) => category.id !== "")
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">Solution Owner</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <input
                        id="ownerId"
                        type="text"
                        name="ownerId"
                        rows="3"
                        className="form-control input-field"
                        value={data.ownerId}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Review Date</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                          slotProps={{
                            textField: {
                              helperText: `${reviewDate}`,
                            },
                          }}
                          value={reviewDate}
                          onChange={(newValue) =>
                            handleReviewDateChange(newValue)
                          }
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <DateValidation
                      className="text-center"
                      reviewDate={data.reviewDate}
                      expiredDate={data.expiredDate}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Expiry Date</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                          slotProps={{
                            textField: {
                              helperText: `${expiredDate}`,
                            },
                          }}
                          value={expiredDate}
                          onChange={(newValue) =>
                            handleExpiredDateChange(newValue)
                          }
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={3}>
                  <h2 className="align-right">Keywords</h2>
                </Grid>
                <Grid item xs={9}>
                  <input
                    id="keyword"
                    type="text"
                    name="keyword"
                    className="form-control input-field"
                    value={data.keyword}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={9}>
                  <p className="input-field-description">
                    * Keywords should be comma separated <br /> Choosing a
                    relevant keyword for a solution will improve its search
                    capability, for example, Printer, toner, paper
                  </p>
                  <h5>Public</h5>
                  <Switch
                    checked={data.isPublic}
                    onChange={handlePublicToggle}
                    color="primary"
                    name="isPublic"
                    id="isPublic"
                  />
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={3}>
                  <h2 className="align-right">Internal Comments</h2>
                </Grid>
                <Grid item xs={9}>
                  <input
                    id="internalComments"
                    type="text"
                    name="internalComments"
                    className="form-control input-field"
                    value={data.internalComments}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </MDBCol>
        </MDBRow>

        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="12" className="mt-2 mb-2">
              <div className="d-flex justify-content-center align-items-center">
                <button
                  type="button"
                  className="btn btn-primary custom-btn-margin"
                  onClick={handleEditSolutionTicket}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary custom-btn-margin"
                >
                  Save and Approve
                </button>
                <button
                  type="button"
                  className="btn btn-secondary custom-btn-margin"
                >
                  Cancel
                </button>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
      </Grid>
    </Grid>
  );
};

export default EditTicketSolution;