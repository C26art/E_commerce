package com.project.ecom.serviceImpl;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.google.common.base.Strings;
import com.project.ecom.constents.SktConstants;
import com.project.ecom.dao.UserDao;
import com.project.ecom.jwt.CustomerUsersDetailsService;
import com.project.ecom.jwt.JwtFilter;
import com.project.ecom.jwt.JwtUtil;
import com.project.ecom.pojo.User;
import com.project.ecom.service.UserService;
import com.project.ecom.utils.EmailUtil;
import com.project.ecom.utils.SktUtils;
import com.project.ecom.wrapper.UserWrapper;

import java.util.Objects;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserServicelmpl implements UserService {

  @Autowired
  UserDao userDao;

  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  CustomerUsersDetailsService customerUsersDetailsService;

  @Autowired
  JwtUtil jwtUtil;

  @Autowired
  JwtFilter jwtFilter;

  @Autowired
  EmailUtil emailUtils;

  @Override
  public ResponseEntity<String> signUp(Map<String, String> requestMap) {
    log.info("inside signup {}", requestMap);
    try {

      if (validateSignUpMap(requestMap)) {
        User user = userDao.findByEmailId(requestMap.get("email"));
        if (Objects.isNull(user)) {
          userDao.save(getUserFromMap(requestMap));
          return SktUtils.getResponseEntity("Successfully Register.", HttpStatus.OK);

        } else {
          return SktUtils.getResponseEntity("Email already exist.", HttpStatus.BAD_REQUEST);
        }

      } else {
        return SktUtils.getResponseEntity(SktConstants.INVALID_DATA, HttpStatus.BAD_REQUEST);
      }
    } catch (Exception ex) {
      ex.printStackTrace();
    }
    return SktUtils.getResponseEntity(SktConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private boolean validateSignUpMap(Map<String, String> requestMap) {
    if (requestMap.containsKey("name") && requestMap.containsKey("email") && requestMap.containsKey("password")) {
        if (!requestMap.get("name").isEmpty() && !requestMap.get("email").isEmpty() && !requestMap.get("password").isEmpty()) {
            return true;
        }
    }
    log.error("Validation failed for signup request: {}", requestMap);
    return false;
}

  private User getUserFromMap(Map<String, String> requestMap) {
    User user = new User();
    user.setName(requestMap.get("name"));
    user.setEmail(requestMap.get("email"));
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    String encodedPassword = encoder.encode(requestMap.get("password"));
    user.setPassword(encodedPassword);
    user.setStatus("false");
    user.setRole("user");
    userDao.save(user);
    return user;

  }

  @Override
public ResponseEntity<String> login(Map<String, String> requestMap) {
    log.info("Inside login");

    try {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(requestMap.get("email"), requestMap.get("password")));

        if (auth.isAuthenticated()) {
            com.project.ecom.pojo.User userDetail = customerUsersDetailsService.getUserDetail();

            // Remova a verificação do status
            String token = jwtUtil.generateToken(userDetail.getEmail(), userDetail.getRole());
            String role = userDetail.getRole();
            return ResponseEntity.ok().body("{\"token\":\"" + token + "\", \"role\":\"" + role + "\"}");
        }
    } catch (Exception ex) {
        log.error("Error during authentication", ex);
    }
    return new ResponseEntity<String>("{\"message\":\"" + "Bad Credentials." + "\"}", HttpStatus.BAD_REQUEST);
}


  @Override
  public ResponseEntity<List<UserWrapper>> getAllUser() {

    try {
      if (jwtFilter.isAdmin()) {
        return new ResponseEntity<>(userDao.getAllUser(), HttpStatus.OK);

      } else {
        return new ResponseEntity<>(new ArrayList<>(), HttpStatus.UNAUTHORIZED);
      }

    } catch (Exception ex) {
      ex.printStackTrace();
    }
    return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Override
  public ResponseEntity<String> update(Map<String, String> requestMap) {

    try {
      if (jwtFilter.isAdmin()) {
        Optional<User> optional = userDao.findById(Integer.parseInt(requestMap.get("id")));
        if (!optional.isEmpty()) {
          userDao.updateStatus(requestMap.get("status"), Integer.parseInt(requestMap.get("id")));

          sendMailToAllAdmin(requestMap.get("status"), optional.get().getEmail(), userDao.getAllAdmin());

          return SktUtils.getResponseEntity("User Status Update Successfully.", HttpStatus.OK);

        } else {
          return SktUtils.getResponseEntity("Use id doesn't not exist.", HttpStatus.OK);
        }

      } else {
        return SktUtils.getResponseEntity(SktConstants.UNAUTHORIZED_ACCESS, HttpStatus.UNAUTHORIZED);
      }

    } catch (Exception ex) {
      ex.printStackTrace();
    }
    return SktUtils.getResponseEntity(SktConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private void sendMailToAllAdmin(String status, String user, List<String> allAdmin) {

    allAdmin.remove(jwtFilter.getCurrentUser());
    if (status != null && status.equalsIgnoreCase("true")) {
      emailUtils.sendSimpleMessage(jwtFilter.getCurrentUser(), "Account Approved",
          "USER:- " + user + "\n is approved by \nADMIN:-" + jwtFilter.getCurrentUser(), allAdmin);

    } else {
      emailUtils.sendSimpleMessage(jwtFilter.getCurrentUser(), "Account Disabled",
          "USER:- " + user + "\n is disabled by \nADMIN:-" + jwtFilter.getCurrentUser(), allAdmin);

    }
  }

  @Override
  public ResponseEntity<String> checkToken() {
    return SktUtils.getResponseEntity("true", HttpStatus.OK);
  }

  @Override
  public ResponseEntity<String> changePassword(Map<String, String> requestMap) {
    try {
      User userObj = userDao.findByEmail(jwtFilter.getCurrentUser());
      if (userObj != null) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        log.info("Old Password: " + requestMap.get("oldPassword"));
        log.info("New Password: " + requestMap.get("newPassword"));
        log.info("Confirmation Password: " + requestMap.get("confirmationPassword"));

        if (encoder.matches(requestMap.get("oldPassword"), userObj.getPassword())) {
          if (requestMap.containsKey("confirmationPassword") &&
              requestMap.get("newPassword").equals(requestMap.get("confirmationPassword"))) {

            userObj.setPassword(encoder.encode(requestMap.get("newPassword")));
            userDao.save(userObj);
            return SktUtils.getResponseEntity("Password Updated Successfully!", HttpStatus.OK);
          } else {
            return SktUtils.getResponseEntity("New Password and Confirmation Password do not match!",
                HttpStatus.BAD_REQUEST);
          }
        }
        return SktUtils.getResponseEntity("Incorrect Old Password!", HttpStatus.BAD_REQUEST);
      }
      return SktUtils.getResponseEntity(SktConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception ex) {
      ex.printStackTrace();
    }
    return SktUtils.getResponseEntity(SktConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Override
  public ResponseEntity<String> forgotPassword(Map<String, String> requestMap) {

    try {

      User user = userDao.findByEmail(requestMap.get("email"));
      if (!Objects.isNull(user) && !Strings.isNullOrEmpty(user.getEmail()))

        emailUtils.forgotMail(user.getEmail(), "Credential by Skate Club Management System.",
            user.getPassword());

      return SktUtils.getResponseEntity("Check your mail for credentials.", HttpStatus.OK);

    } catch (Exception ex) {
      ex.printStackTrace();
    }
    return SktUtils.getResponseEntity(SktConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
  }

}
