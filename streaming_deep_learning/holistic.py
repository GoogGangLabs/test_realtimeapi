import cv2
import numpy
import mediapipe as mp
import base64

import os
import time

def getTime():
  return time.time()

def printTime(start, sequence, desc):
  end = getTime()
  print(f"sequence > {sequence}, {round((end - start) * 1000, 3)}ms - {desc}")

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(static_image_mode=True)

def get_landmark_list(landmarks):
  landmark_list = []

  if landmarks is None:
    return landmark_list

  for _, landmark in enumerate(landmarks.landmark):
    element = {}
    element['x'] = landmark.x
    element['y'] = landmark.y
    element['z'] = landmark.z

    if landmark.visibility > 0.0:
      element['visibility'] = landmark.visibility

    landmark_list.append(element)

  return landmark_list

def process(base64Data, sequence):
  start = getTime()
  buffer = base64.b64decode(base64Data)
  printTime(start, sequence, "Base64 to Buffer")
  start = getTime()
  np_data = numpy.frombuffer(buffer, numpy.uint8)
  printTime(start, sequence, "Buffer to Numpy array")
  start = getTime()
  image = cv2.imdecode(np_data, cv2.IMREAD_UNCHANGED)
  printTime(start, sequence, "np to cv2 image")
  start = getTime()
  results = holistic.process(image[..., ::-1])
  printTime(start, sequence, "Holistic process")


  start = getTime()
  result = {
    'left_hand': get_landmark_list(results.left_hand_landmarks),
    'right_hand': get_landmark_list(results.right_hand_landmarks),
    'pose': get_landmark_list(results.pose_landmarks),
    'face': get_landmark_list(results.face_landmarks)
  }
  printTime(start, sequence, "Holistic result to JSON")

  return result
